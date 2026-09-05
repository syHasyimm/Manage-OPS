<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegistrationPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PeriodController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Periods/Index', [
            'periods' => RegistrationPeriod::orderByDesc('id')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'academic_year' => ['required', 'string', 'max:16', 'unique:registration_periods,academic_year'],
            'opens_at' => ['required', 'date'],
            'closes_at' => ['required', 'date', 'after:opens_at'],
            'is_active' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated) {
            if (! empty($validated['is_active'])) {
                RegistrationPeriod::where('is_active', true)->update(['is_active' => false]);
            }

            RegistrationPeriod::create($validated);
        });

        return back()->with('status', 'Periode dibuat.');
    }

    public function update(Request $request, RegistrationPeriod $period): RedirectResponse
    {
        $validated = $request->validate([
            'academic_year' => ['required', 'string', 'max:16', 'unique:registration_periods,academic_year,'.$period->id],
            'opens_at' => ['required', 'date'],
            'closes_at' => ['required', 'date', 'after:opens_at'],
            'is_active' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated, $period) {
            if (! empty($validated['is_active'])) {
                RegistrationPeriod::where('id', '!=', $period->id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            $period->update($validated);
        });

        return back()->with('status', 'Periode diperbarui.');
    }

    public function activate(RegistrationPeriod $period): RedirectResponse
    {
        DB::transaction(function () use ($period) {
            RegistrationPeriod::where('is_active', true)->update(['is_active' => false]);
            $period->update(['is_active' => true]);
        });

        return back()->with('status', "Periode {$period->academic_year} diaktifkan.");
    }

    public function deactivate(RegistrationPeriod $period): RedirectResponse
    {
        $period->update(['is_active' => false]);

        return back()->with('status', "Periode {$period->academic_year} dinonaktifkan.");
    }
}
