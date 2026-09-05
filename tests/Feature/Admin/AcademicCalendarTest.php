<?php

use App\Models\AcademicCalendar;
use App\Models\User;
use Database\Seeders\RegistrationPeriodSeeder;

beforeEach(function () {
    $this->seed(RegistrationPeriodSeeder::class);
});

test('guest or non-admin cannot access academic calendar page', function () {
    $this->get(route('admin.academic-calendars.index'))
        ->assertRedirect(route('login'));

    $user = User::factory()->create(['phone_verified_at' => now()]);
    $this->actingAs($user)
        ->get(route('admin.academic-calendars.index'))
        ->assertForbidden();
});

test('admin can access academic calendar index with required inertia props', function () {
    $admin = User::factory()->admin()->create(['phone_verified_at' => now()]);

    AcademicCalendar::create([
        'title' => 'Ujian Tengah Semester',
        'category' => 'Kegiatan Akademik',
        'start_date' => now()->toDateString(),
        'end_date' => now()->addDays(5)->toDateString(),
        'academic_year' => '2025/2026',
        'semester' => 'Ganjil',
        'description' => 'UTS semester ganjil',
        'target_audience' => 'Semua',
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.academic-calendars.index'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/AcademicCalendars/Index')
            ->has('categories')
            ->has('category_colors')
            ->has('upcoming_events')
            ->has('stats')
            ->has('active_academic_year')
        );
});

test('admin can fetch json events and filter by category', function () {
    $admin = User::factory()->admin()->create(['phone_verified_at' => now()]);

    $academic = AcademicCalendar::create([
        'title' => 'UAS Ganjil',
        'category' => 'Kegiatan Akademik',
        'start_date' => '2026-10-01',
        'end_date' => '2026-10-10',
        'target_audience' => 'Semua',
    ]);

    $holiday = AcademicCalendar::create([
        'title' => 'Libur Nasional',
        'category' => 'Libur Nasional',
        'start_date' => '2026-10-15',
        'end_date' => '2026-10-15',
        'target_audience' => 'Semua',
    ]);

    // Fetch all events for the range
    $response = $this->actingAs($admin)
        ->getJson(route('admin.academic-calendars.index', [
            'start' => '2026-10-01',
            'end' => '2026-10-31',
        ]));

    $response->assertOk()
        ->assertJsonCount(2);

    // Fetch filtered by category
    $filteredResponse = $this->actingAs($admin)
        ->getJson(route('admin.academic-calendars.index', [
            'start' => '2026-10-01',
            'end' => '2026-10-31',
            'category' => 'Kegiatan Akademik',
        ]));

    $filteredResponse->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment(['title' => 'UAS Ganjil']);
});

test('admin can store, update, and delete academic calendar event', function () {
    $admin = User::factory()->admin()->create(['phone_verified_at' => now()]);

    // Store
    $storeResponse = $this->actingAs($admin)
        ->post(route('admin.academic-calendars.store'), [
            'title' => 'Class Meeting',
            'category' => 'Kegiatan Sekolah',
            'start_date' => '2026-12-15',
            'end_date' => '2026-12-18',
            'academic_year' => '2026/2027',
            'semester' => 'Ganjil',
            'target_audience' => 'Siswa',
            'description' => 'Lomba antar kelas',
        ]);

    $storeResponse->assertRedirect();
    $event = AcademicCalendar::where('title', 'Class Meeting')->first();
    expect($event)->not->toBeNull();
    expect($event->category)->toBe('Kegiatan Sekolah');
    expect($event->target_audience)->toBe('Siswa');

    // Update
    $updateResponse = $this->actingAs($admin)
        ->put(route('admin.academic-calendars.update', $event), [
            'title' => 'Class Meeting & Bazar',
            'category' => 'Kegiatan Sekolah',
            'start_date' => '2026-12-15',
            'end_date' => '2026-12-19',
            'academic_year' => '2026/2027',
            'semester' => 'Ganjil',
            'target_audience' => 'Semua',
            'description' => 'Lomba dan pameran bazar karya siswa',
        ]);

    $updateResponse->assertRedirect();
    expect($event->fresh()->title)->toBe('Class Meeting & Bazar');
    expect($event->fresh()->target_audience)->toBe('Semua');

    // Delete
    $deleteResponse = $this->actingAs($admin)
        ->delete(route('admin.academic-calendars.destroy', $event));

    $deleteResponse->assertRedirect();
    expect(AcademicCalendar::find($event->id))->toBeNull();
});
