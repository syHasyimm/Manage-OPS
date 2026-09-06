<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolMission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SchoolMissionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/SchoolMissions/Index', [
            'missions' => SchoolMission::orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'body' => ['required', 'string'],
            'sort_order' => ['integer'],
        ]);

        $validated['sort_order'] = $validated['sort_order'] ?? (SchoolMission::max('sort_order') + 1);

        SchoolMission::create($validated);

        return redirect()->back()->with('status', 'Misi berhasil ditambahkan.');
    }

    public function update(Request $request, SchoolMission $school_mission)
    {
        $validated = $request->validate([
            'body' => ['required', 'string'],
        ]);

        $school_mission->update($validated);

        return redirect()->back()->with('status', 'Misi berhasil diperbarui.');
    }

    public function destroy(SchoolMission $school_mission)
    {
        $school_mission->delete();

        return redirect()->back()->with('status', 'Misi berhasil dihapus.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:school_missions,id'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $item) {
            SchoolMission::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return redirect()->back();
    }
}
