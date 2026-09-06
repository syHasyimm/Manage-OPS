<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolFacility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SchoolFacilityController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SchoolFacilities/Index', [
            'facilities' => SchoolFacility::orderBy('sort_order')->get()->map(function ($item) {
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
            $filename = 'facility-'.time().'.'.$ext;
            $validated['image_path'] = $file->storeAs('facilities', $filename, 'public');
        }

        $validated['sort_order'] = $validated['sort_order'] ?? (SchoolFacility::max('sort_order') + 1);

        SchoolFacility::create($validated);

        return redirect()->back()->with('status', 'Fasilitas berhasil ditambahkan.');
    }

    public function update(Request $request, SchoolFacility $school_facility)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string'],
            'icon' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            if ($school_facility->image_path && Storage::disk('public')->exists($school_facility->image_path)) {
                Storage::disk('public')->delete($school_facility->image_path);
            }
            $file = $request->file('image');
            $ext = $file->getClientOriginalExtension();
            $filename = 'facility-'.time().'.'.$ext;
            $validated['image_path'] = $file->storeAs('facilities', $filename, 'public');
        } elseif ($request->boolean('remove_image')) {
            if ($school_facility->image_path && Storage::disk('public')->exists($school_facility->image_path)) {
                Storage::disk('public')->delete($school_facility->image_path);
            }
            $validated['image_path'] = null;
        }

        $school_facility->update($validated);

        return redirect()->back()->with('status', 'Fasilitas berhasil diperbarui.');
    }

    public function destroy(SchoolFacility $school_facility)
    {
        if ($school_facility->image_path && Storage::disk('public')->exists($school_facility->image_path)) {
            Storage::disk('public')->delete($school_facility->image_path);
        }
        $school_facility->delete();

        return redirect()->back()->with('status', 'Fasilitas berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:school_facilities,id'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $item) {
            SchoolFacility::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back();
    }
}
