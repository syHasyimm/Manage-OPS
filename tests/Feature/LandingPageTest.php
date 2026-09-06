<?php

use App\Models\AcademicCalendar;
use App\Models\Faq;
use App\Models\RegistrationPeriod;
use App\Models\SchoolSetting;
use App\Models\Staff;
use App\Models\Student;
use Inertia\Testing\AssertableInertia as Assert;

test('landing page can be rendered with complete school profile props', function () {
    // Setup dummy school setting
    SchoolSetting::current()->update([
        'name' => 'SD Negeri 001 Kepenuhan',
        'district' => 'Kepenuhan',
        'npsn' => '10403164',
        'accreditation' => 'A',
    ]);

    // Setup dummy period
    RegistrationPeriod::create([
        'academic_year' => '2026/2027',
        'opens_at' => now()->subDay(),
        'closes_at' => now()->addMonth(),
        'is_active' => true,
    ]);

    // Setup staff
    Staff::create([
        'name' => 'Budi Santoso, S.Pd.',
        'nik' => '1234567890123456',
        'birth_place' => 'Kepenuhan',
        'birth_date' => '1985-05-12',
        'jabatan' => 'Kepala Sekolah',
        'jenis' => 'guru',
    ]);

    // Setup academic calendar
    AcademicCalendar::create([
        'title' => 'Asesmen Nasional Berbasis Komputer (ANBK)',
        'category' => 'Akademik',
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(7)->toDateString(),
    ]);

    // Setup FAQ
    Faq::create([
        'question' => 'Apakah pendaftaran gratis?',
        'answer' => 'Ya, pendaftaran tidak dipungut biaya.',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('period')
            ->has('staffList', 1)
            ->has('academicCalendars', 1)
            ->has('faqs', 1)
            ->has('stats')
            ->where('stats.accreditation', 'A')
            ->where('stats.npsn', '10403164')
            ->has('school')
            ->where('school.name', 'SD Negeri 001 Kepenuhan')
        );
});
