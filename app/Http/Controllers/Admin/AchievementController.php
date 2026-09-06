<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AchievementController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Achievements/Index', [
            'achievements' => Achievement::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer'],
            'level' => ['nullable', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        $validated['sort_order'] = $validated['sort_order'] ?? (Achievement::max('sort_order') + 1);

        Achievement::create($validated);

        return redirect()->back()->with('status', 'Prestasi berhasil ditambahkan.');
    }

    public function update(Request $request, Achievement $achievement)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer'],
            'level' => ['nullable', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        $achievement->update($validated);

        return redirect()->back()->with('status', 'Prestasi berhasil diperbarui.');
    }

    public function destroy(Achievement $achievement)
    {
        $achievement->delete();

        return redirect()->back()->with('status', 'Prestasi berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:achievements,id'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $item) {
            Achievement::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back();
    }
}
