<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolGallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SchoolGalleryController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SchoolGalleries/Index', [
            'galleries' => SchoolGallery::orderBy('sort_order')->get()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'category' => $item->category,
                    'image_url' => Storage::disk('public')->url($item->image_path),
                    'sort_order' => $item->sort_order,
                    'is_active' => $item->is_active,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
            'image' => ['required', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
            'sort_order' => ['integer'],
        ]);

        $file = $request->file('image');
        $ext = $file->getClientOriginalExtension();
        $filename = 'gallery-'.time().'.'.$ext;
        $validated['image_path'] = $file->storeAs('galleries', $filename, 'public');

        $validated['sort_order'] = $validated['sort_order'] ?? (SchoolGallery::max('sort_order') + 1);

        SchoolGallery::create($validated);

        return redirect()->back()->with('status', 'Foto Galeri berhasil ditambahkan.');
    }

    public function update(Request $request, SchoolGallery $school_gallery)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            if ($school_gallery->image_path && Storage::disk('public')->exists($school_gallery->image_path)) {
                Storage::disk('public')->delete($school_gallery->image_path);
            }
            $file = $request->file('image');
            $ext = $file->getClientOriginalExtension();
            $filename = 'gallery-'.time().'.'.$ext;
            $validated['image_path'] = $file->storeAs('galleries', $filename, 'public');
        }

        $school_gallery->update($validated);

        return redirect()->back()->with('status', 'Foto Galeri berhasil diperbarui.');
    }

    public function destroy(SchoolGallery $school_gallery)
    {
        if ($school_gallery->image_path && Storage::disk('public')->exists($school_gallery->image_path)) {
            Storage::disk('public')->delete($school_gallery->image_path);
        }
        $school_gallery->delete();

        return redirect()->back()->with('status', 'Foto Galeri berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:school_galleries,id'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $item) {
            SchoolGallery::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back();
    }
}
