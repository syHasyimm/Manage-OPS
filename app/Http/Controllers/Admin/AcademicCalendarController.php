<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicCalendar;
use App\Models\RegistrationPeriod;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcademicCalendarController extends Controller
{
    public const CATEGORIES = [
        'Hari Efektif Belajar',
        'Libur Nasional',
        'Libur Semester',
        'Kegiatan Akademik',
        'Kegiatan Sekolah',
        'Rapat/Agenda Internal',
        'Cuti Bersama',
    ];

    public const CATEGORY_COLORS = [
        'Hari Efektif Belajar' => '#2563eb', // blue-600
        'Libur Nasional' => '#ef4444', // red-500
        'Libur Semester' => '#f97316', // orange-500
        'Kegiatan Akademik' => '#10b981', // emerald-500
        'Kegiatan Sekolah' => '#8b5cf6', // purple-500
        'Rapat/Agenda Internal' => '#64748b', // slate-500
        'Cuti Bersama' => '#ec4899', // pink-500
    ];

    public function index(Request $request)
    {
        if ($request->wantsJson() || $request->has('start')) {
            $query = AcademicCalendar::query();

            if ($request->has('start') && $request->has('end')) {
                // FullCalendar sends ISO8601 strings
                $start = Carbon::parse($request->start)->toDateString();
                $end = Carbon::parse($request->end)->toDateString();

                $query->where(function ($q) use ($start, $end) {
                    $q->whereBetween('start_date', [$start, $end])
                        ->orWhereBetween('end_date', [$start, $end])
                        ->orWhere(function ($q2) use ($start, $end) {
                            $q2->where('start_date', '<=', $start)
                                ->where('end_date', '>=', $end);
                        });
                });
            }

            if ($category = $request->query('category')) {
                $query->where('category', $category);
            }

            $events = $query->get()->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'start' => $event->start_date->format('Y-m-d'),
                    // FullCalendar exclusive end date issue:
                    // End date is exclusive in FullCalendar if it's an all-day event, so we add 1 day to end_date
                    'end' => $event->end_date->copy()->addDay()->format('Y-m-d'),
                    'backgroundColor' => $event->color ?: (self::CATEGORY_COLORS[$event->category] ?? '#2563eb'),
                    'borderColor' => $event->color ?: (self::CATEGORY_COLORS[$event->category] ?? '#2563eb'),
                    'extendedProps' => [
                        'category' => $event->category,
                        'academic_year' => $event->academic_year,
                        'semester' => $event->semester,
                        'description' => $event->description,
                        'target_audience' => $event->target_audience,
                        'original_end_date' => $event->end_date->format('Y-m-d'), // Keep the original for editing
                    ],
                ];
            });

            return response()->json($events);
        }

        $today = Carbon::today();
        $upcomingEvents = AcademicCalendar::where('end_date', '>=', $today->toDateString())
            ->orderBy('start_date', 'asc')
            ->take(6)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'category' => $event->category,
                    'start_date' => $event->start_date->format('Y-m-d'),
                    'end_date' => $event->end_date->format('Y-m-d'),
                    'academic_year' => $event->academic_year,
                    'semester' => $event->semester,
                    'description' => $event->description,
                    'target_audience' => $event->target_audience,
                    'color' => $event->color ?: (self::CATEGORY_COLORS[$event->category] ?? '#2563eb'),
                ];
            });

        $startOfMonth = $today->copy()->startOfMonth()->toDateString();
        $endOfMonth = $today->copy()->endOfMonth()->toDateString();

        $stats = [
            'total' => AcademicCalendar::count(),
            'academic' => AcademicCalendar::where('category', 'Kegiatan Akademik')->count(),
            'holidays' => AcademicCalendar::whereIn('category', ['Libur Nasional', 'Libur Semester', 'Cuti Bersama'])->count(),
            'this_month' => AcademicCalendar::where(function ($q) use ($startOfMonth, $endOfMonth) {
                $q->whereBetween('start_date', [$startOfMonth, $endOfMonth])
                    ->orWhereBetween('end_date', [$startOfMonth, $endOfMonth]);
            })->count(),
        ];

        $activePeriod = RegistrationPeriod::active();

        return Inertia::render('Admin/AcademicCalendars/Index', [
            'categories' => self::CATEGORIES,
            'category_colors' => self::CATEGORY_COLORS,
            'upcoming_events' => $upcomingEvents,
            'stats' => $stats,
            'active_academic_year' => $activePeriod?->academic_year ?? (date('Y').'/'.(date('Y') + 1)),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'semester' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'target_audience' => ['required', 'string'],
        ]);

        $validated['color'] = self::CATEGORY_COLORS[$validated['category']] ?? '#3b82f6';

        AcademicCalendar::create($validated);

        return redirect()->back()->with('status', 'Agenda berhasil ditambahkan.');
    }

    public function update(Request $request, AcademicCalendar $academic_calendar)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'semester' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'target_audience' => ['required', 'string'],
        ]);

        $validated['color'] = self::CATEGORY_COLORS[$validated['category']] ?? '#3b82f6';

        $academic_calendar->update($validated);

        return redirect()->back()->with('status', 'Agenda berhasil diperbarui.');
    }

    public function destroy(AcademicCalendar $academic_calendar)
    {
        $academic_calendar->delete();

        return redirect()->back()->with('status', 'Agenda berhasil dihapus.');
    }
}
