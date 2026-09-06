<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SchoolProgramController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SchoolPrograms/Index', [
            'programs' => SchoolProgram::orderBy('sort_order')->get()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'description' => $item->description,
                    'icon' => $item->icon,
                    'image_url' => $item->image_path ? Storage::disk('public')->url($item->image_path) : null,
                    'sort_order' => $item->sort_order,
                    'is_active' => $item->is_active,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string'],
            'icon' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
            'sort_order' => ['integer'],
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $ext = $file->getClientOriginalExtension();
            $filename = 'program-'.time().'.'.$ext;
            $validated['image_path'] = $file->storeAs('programs', $filename, 'public');
        }

        $validated['sort_order'] = $validated['sort_order'] ?? (SchoolProgram::max('sort_order') + 1);

        SchoolProgram::create($validated);

        return redirect()->back()->with('status', 'Program Unggulan berhasil ditambahkan.');
    }

    public function update(Request $request, SchoolProgram $school_program)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string'],
            'icon' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            if ($school_program->image_path && Storage::disk('public')->exists($school_program->image_path)) {
                Storage::disk('public')->delete($school_program->image_path);
            }
            $file = $request->file('image');
            $ext = $file->getClientOriginalExtension();
            $filename = 'program-'.time().'.'.$ext;
            $validated['image_path'] = $file->storeAs('programs', $filename, 'public');
        } elseif ($request->boolean('remove_image')) {
            if ($school_program->image_path && Storage::disk('public')->exists($school_program->image_path)) {
                Storage::disk('public')->delete($school_program->image_path);
            }
            $validated['image_path'] = null;
        }

        $school_program->update($validated);

        return redirect()->back()->with('status', 'Program Unggulan berhasil diperbarui.');
    }

    public function destroy(SchoolProgram $school_program)
    {
        if ($school_program->image_path && Storage::disk('public')->exists($school_program->image_path)) {
            Storage::disk('public')->delete($school_program->image_path);
        }
        $school_program->delete();

        return redirect()->back()->with('status', 'Program Unggulan berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:school_programs,id'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $item) {
            SchoolProgram::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back();
    }
}
