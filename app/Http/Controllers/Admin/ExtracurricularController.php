<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Extracurricular;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExtracurricularController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Extracurriculars/Index', [
            'extracurriculars' => Extracurricular::orderBy('sort_order')->get()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'category' => $item->category,
                    'badge' => $item->badge,
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
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'badge' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
            'sort_order' => ['integer'],
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $ext = $file->getClientOriginalExtension();
            $filename = 'extracurricular-'.time().'.'.$ext;
            $validated['image_path'] = $file->storeAs('extracurriculars', $filename, 'public');
        }

        $validated['sort_order'] = $validated['sort_order'] ?? (Extracurricular::max('sort_order') + 1);

        Extracurricular::create($validated);

        return redirect()->back()->with('status', 'Ekstrakurikuler berhasil ditambahkan.');
    }

    public function update(Request $request, Extracurricular $extracurricular)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:100'],
            'badge' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            if ($extracurricular->image_path && Storage::disk('public')->exists($extracurricular->image_path)) {
                Storage::disk('public')->delete($extracurricular->image_path);
            }
            $file = $request->file('image');
            $ext = $file->getClientOriginalExtension();
            $filename = 'extracurricular-'.time().'.'.$ext;
            $validated['image_path'] = $file->storeAs('extracurriculars', $filename, 'public');
        } elseif ($request->boolean('remove_image')) {
            if ($extracurricular->image_path && Storage::disk('public')->exists($extracurricular->image_path)) {
                Storage::disk('public')->delete($extracurricular->image_path);
            }
            $validated['image_path'] = null;
        }

        $extracurricular->update($validated);

        return redirect()->back()->with('status', 'Ekstrakurikuler berhasil diperbarui.');
    }

    public function destroy(Extracurricular $extracurricular)
    {
        if ($extracurricular->image_path && Storage::disk('public')->exists($extracurricular->image_path)) {
            Storage::disk('public')->delete($extracurricular->image_path);
        }
        $extracurricular->delete();

        return redirect()->back()->with('status', 'Ekstrakurikuler berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:extracurriculars,id'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $item) {
            Extracurricular::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back();
    }
}
