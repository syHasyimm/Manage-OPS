<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolValue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolValueController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SchoolValues/Index', [
            'values' => SchoolValue::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string'],
            'icon' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['integer'],
        ]);

        $validated['sort_order'] = $validated['sort_order'] ?? (SchoolValue::max('sort_order') + 1);

        SchoolValue::create($validated);

        return redirect()->back()->with('status', 'Nilai Karakter berhasil ditambahkan.');
    }

    public function update(Request $request, SchoolValue $school_value)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $school_value->update($validated);

        return redirect()->back()->with('status', 'Nilai Karakter berhasil diperbarui.');
    }

    public function destroy(SchoolValue $school_value)
    {
        $school_value->delete();

        return redirect()->back()->with('status', 'Nilai Karakter berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:school_values,id'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $item) {
            SchoolValue::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back();
    }
}
