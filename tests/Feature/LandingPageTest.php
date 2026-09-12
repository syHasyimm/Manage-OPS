<?php

use App\Models\RegistrationPeriod;
use App\Models\SchoolSetting;
use Inertia\Testing\AssertableInertia as Assert;

test('spmb landing page can be rendered with its focused props', function () {
    SchoolSetting::current()->update([
        'name' => 'SD Negeri 001 Kepenuhan',
        'district' => 'Kepenuhan',
        'npsn' => '10403164',
        'accreditation' => 'A',
    ]);

    RegistrationPeriod::create([
        'academic_year' => '2026/2027',
        'opens_at' => now()->subDay(),
        'closes_at' => now()->addMonth(),
        'is_active' => true,
    ]);

    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('period')
            ->where('period.academic_year', '2026/2027')
            ->where('registrationOpen', true)
            ->where('canLogin', true)
            ->where('canRegister', true)
            ->has('school')
            ->where('school.name', 'SD Negeri 001 Kepenuhan')
            ->missing('staffList')
            ->missing('academicCalendars')
            ->missing('faqs')
            ->missing('stats')
        );
});

test('spmb landing page reports an active period outside its dates as closed', function () {
    RegistrationPeriod::create([
        'academic_year' => '2027/2028',
        'opens_at' => now()->addWeek(),
        'closes_at' => now()->addMonth(),
        'is_active' => true,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('period.academic_year', '2027/2028')
            ->where('registrationOpen', false)
        );
});
