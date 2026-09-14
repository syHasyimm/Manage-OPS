<?php

use App\Models\SchoolSetting;
use App\Models\Staff;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validSppdPayload(Staff $staff): array
{
    return [
        'letter_number' => '400.3.5.3/012-SPPD/SD/2026',
        'travelers' => [
            [
                'staff_id' => $staff->id,
                'salary' => 'Rp4.250.000',
                'travel_level' => 'Tingkat C',
            ],
        ],
        'purpose' => 'Mengikuti rapat koordinasi pendidikan dasar.',
        'transportation' => 'Kendaraan darat',
        'departure_place' => 'SD Negeri 001 Kepenuhan',
        'destination' => 'Dinas Pendidikan Kabupaten Rokan Hulu',
        'departure_date' => '2026-09-15',
        'return_date' => '2026-09-16',
        'followers' => [],
        'agency' => 'SD Negeri 001 Kepenuhan',
        'budget_account' => 'BOS Reguler',
        'other_notes' => 'Membawa surat tugas.',
        'issue_place' => 'Kepenuhan',
        'issue_date' => '2026-09-14',
    ];
}

function createSppdStaff(): Staff
{
    return Staff::query()->create([
        'name' => 'Budi Santoso, S.Pd.',
        'nip' => '198504122010011006',
        'nuptk' => '1234567890123456',
        'nik' => '1406011204850001',
        'birth_place' => 'Kepenuhan',
        'birth_date' => '1985-04-12',
        'jabatan' => 'Guru Kelas',
        'pangkat' => 'Penata Muda Tk. I',
        'golongan' => 'III/b',
        'jenis' => 'guru',
    ]);
}

test('only admins can access the SPPD form', function () {
    $user = User::factory()->create(['phone_verified_at' => now()]);

    $this->actingAs($user)
        ->get(route('admin.sppd.create'))
        ->assertForbidden();

    $this->actingAsGuest()
        ->get(route('admin.sppd.create'))
        ->assertRedirect(route('login'));
});

test('admin can open the SPPD form with staff master data', function () {
    $admin = User::factory()->admin()->create(['phone_verified_at' => now()]);
    $staff = createSppdStaff();

    $this->actingAs($admin)
        ->get(route('admin.sppd.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Sppd/Create')
            ->has('staff', 1)
            ->where('staff.0.id', $staff->id)
            ->where('staff.0.name', $staff->name)
            ->where('staff.0.position', $staff->jabatan));
});

test('SPPD requires its core travel fields', function () {
    $admin = User::factory()->admin()->create(['phone_verified_at' => now()]);

    $this->actingAs($admin)
        ->post(route('admin.sppd.store'), ['travelers' => []])
        ->assertSessionHasErrors([
            'letter_number',
            'travelers',
            'purpose',
            'transportation',
            'departure_place',
            'destination',
            'departure_date',
            'return_date',
            'agency',
            'budget_account',
            'issue_place',
            'issue_date',
        ]);
});

test('admin can generate a two-page SPPD PDF from staff data', function () {
    $admin = User::factory()->admin()->create(['phone_verified_at' => now()]);
    $staff = createSppdStaff();
    $setting = SchoolSetting::current();
    $setting->forceFill([
        'principal_name' => 'Dra. Siti Rahmawati',
        'principal_nip' => '197208171998032004',
        'principal_title' => 'Kepala Sekolah',
        'principal_rank' => 'Pembina',
        'principal_grade' => 'IV/a',
        'signature_city' => 'Kepenuhan',
    ])->save();
    SchoolSetting::bust();

    $this->actingAs($admin)
        ->post(route('admin.sppd.store'), validSppdPayload($staff))
        ->assertRedirect()
        ->assertSessionHas('status', 'SPPD sedang disiapkan untuk diunduh.');

    $response = $this->actingAs($admin)->get(route('admin.sppd.download'));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf')
        ->and(substr($response->getContent(), 0, 4))->toBe('%PDF');
});

test('SPPD download requires a pending form payload', function () {
    $admin = User::factory()->admin()->create(['phone_verified_at' => now()]);

    $this->actingAs($admin)
        ->get(route('admin.sppd.download'))
        ->assertRedirect(route('admin.sppd.create'))
        ->assertSessionHas('error', 'Data SPPD tidak ditemukan. Silakan isi formulir kembali.');
});
