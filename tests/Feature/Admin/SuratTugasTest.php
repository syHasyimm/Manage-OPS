<?php

use App\Models\SchoolSetting;
use App\Models\User;

test('only admins can access the Surat Tugas form', function () {
    $user = User::factory()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('admin.surat-tugas.create'))
        ->assertForbidden();

    $this->actingAsGuest()
        ->get(route('admin.surat-tugas.create'))
        ->assertRedirect(route('login'));
});

test('admin can open the Surat Tugas form', function () {
    $admin = User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.surat-tugas.create'))
        ->assertOk();
});

test('Surat Tugas requires the required fields', function () {
    $admin = User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.surat-tugas.store'), [
            'assignees' => [],
        ])
        ->assertSessionHasErrors([
            'nomor_surat',
            'assignees',
            'activity_name',
            'activity_date',
            'activity_place',
            'letter_place',
            'letter_date',
        ]);
});

test('admin can generate a multi-person Surat Tugas PDF', function () {
    $admin = User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);
    $setting = SchoolSetting::current();
    $setting->forceFill([
        'principal_name' => 'Drs. Kepala Sekolah',
        'principal_nip' => '196801011990031001',
        'principal_title' => 'Kepala Sekolah',
        'signature_city' => 'Kepenuhan',
    ])->save();
    SchoolSetting::bust();

    $this->actingAs($admin)
        ->post(route('admin.surat-tugas.store'), [
            'nomor_surat' => '800/123/SPT/SD-001/2026',
            'assignees' => [
                [
                    'name' => 'Budi Santoso',
                    'position' => 'Guru Kelas',
                    'unit_kerja' => 'SD Negeri 001 Kepenuhan',
                ],
                [
                    'name' => 'Siti Aminah',
                    'position' => 'Operator Sekolah',
                    'unit_kerja' => 'SD Negeri 001 Kepenuhan',
                ],
            ],
            'activity_name' => 'Rapat Koordinasi Sekolah',
            'activity_date' => '2026-09-03',
            'activity_place' => 'Aula Kecamatan Kepenuhan',
            'letter_place' => 'Kepenuhan',
            'letter_date' => '2026-09-01',
        ])
        ->assertRedirect();

    $response = $this->actingAs($admin)
        ->get(route('admin.surat-tugas.download'));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf')
        ->and(substr($response->getContent(), 0, 4))->toBe('%PDF');
});

test('Surat Tugas download requires a pending form payload', function () {
    $admin = User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.surat-tugas.download'))
        ->assertRedirect(route('admin.surat-tugas.create'))
        ->assertSessionHas('error', 'Data surat tidak ditemukan. Silakan isi formulir kembali.');
});
