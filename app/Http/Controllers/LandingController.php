<?php

namespace App\Http\Controllers;

use App\Models\AcademicCalendar;
use App\Models\Achievement;
use App\Models\Extracurricular;
use App\Models\Faq;
use App\Models\RegistrationPeriod;
use App\Models\SchoolFacility;
use App\Models\SchoolGallery;
use App\Models\SchoolMission;
use App\Models\SchoolProgram;
use App\Models\SchoolSetting;
use App\Models\SchoolValue;
use App\Models\Staff;
use App\Models\Student;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Tampilkan landing page profil SD Negeri 001 Kepenuhan
     * beserta modul informasi & pendaftaran SPMB yang elegan dan simpel.
     */
    public function __invoke(): Response
    {
        $period = RegistrationPeriod::active();

        // Ambil daftar dewan guru / staf terdepan
        $staffList = Staff::query()
            ->orderByRaw("CASE 
                WHEN LOWER(COALESCE(jabatan, '')) LIKE '%kepala sekolah%' THEN 1 
                WHEN LOWER(COALESCE(jabatan, '')) LIKE '%wakil%' THEN 2 
                WHEN LOWER(COALESCE(jenis, '')) IN ('guru', 'pendidik') THEN 3 
                ELSE 4 
            END")
            ->orderBy('name')
            ->take(8)
            ->get(['id', 'name', 'jabatan', 'jenis', 'pangkat', 'golongan']);

        // Agenda & kalender akademik terdekat
        $academicCalendars = AcademicCalendar::query()
            ->where('end_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->take(4)
            ->get(['id', 'title', 'category', 'start_date', 'end_date', 'description', 'color']);

        // Jika belum ada agenda mendatang, tampilkan agenda terbaru
        if ($academicCalendars->isEmpty()) {
            $academicCalendars = AcademicCalendar::query()
                ->latest('start_date')
                ->take(4)
                ->get(['id', 'title', 'category', 'start_date', 'end_date', 'description', 'color']);
        }

        // FAQs aktif untuk informasi orang tua / pendaftar
        $faqs = Faq::active()
            ->orderBy('sort_order')
            ->take(6)
            ->get(['id', 'question', 'answer']);

        // Fetch dynamic landing page content
        $missions = SchoolMission::orderBy('sort_order')->get(['id', 'body']);
        $values = SchoolValue::orderBy('sort_order')->get(['id', 'title', 'description', 'icon']);
        $programs = SchoolProgram::active()->orderBy('sort_order')->get();
        $facilities = SchoolFacility::active()->orderBy('sort_order')->get();
        $extracurriculars = Extracurricular::active()->orderBy('sort_order')->get();
        $achievements = Achievement::active()->orderBy('year', 'desc')->orderBy('sort_order')->get();
        $galleries = SchoolGallery::active()->orderBy('sort_order')->get();

        $totalStudents = Student::query()->count();
        $totalStaff = Staff::query()->count();
        $schoolSetting = SchoolSetting::current();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'period' => $period,
            'staffList' => $staffList,
            'academicCalendars' => $academicCalendars,
            'faqs' => $faqs,
            'missions' => $missions,
            'values' => $values,
            'programs' => $programs,
            'facilities' => $facilities,
            'extracurriculars' => $extracurriculars,
            'achievements' => $achievements,
            'galleries' => $galleries,
            'stats' => [
                'total_students' => $totalStudents,
                'total_staff' => $totalStaff,
                'accreditation' => $schoolSetting?->accreditation ?: 'A',
                'npsn' => $schoolSetting?->npsn ?: '10403164',
            ],
        ]);
    }
}
