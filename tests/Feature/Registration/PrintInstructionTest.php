<?php

use App\Jobs\SendPrintInstructionNotification;
use App\Models\Registration;
use App\Models\StudentIdentity;
use App\Models\User;
use App\Models\WhatsappLog;
use Database\Seeders\RegistrationPeriodSeeder;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(RegistrationPeriodSeeder::class);
    Storage::fake('public');
});

/**
 * Buat user terverifikasi + registrasi tersubmit dengan PDF placeholder pada disk fake.
 */
function makeSubmittedRegistration(string $status = Registration::STATUS_SUBMITTED, ?string $phoneWa = null): Registration
{
    $user = User::factory()->create([
        'phone_verified_at' => now(),
        'phone' => '081299999999',
    ]);

    $period = \App\Models\RegistrationPeriod::active();

    $registration = Registration::create([
        'user_id' => $user->id,
        'period_id' => $period->id,
        'registration_number' => 'SPMB-2026-0001',
        'status' => $status,
        'current_step' => 3,
        'has_guardian' => false,
        'contact_email' => 'wali@example.com',
        'submitted_at' => now(),
        'pdf_path' => 'registrations/SPMB-2026-0001.pdf',
    ]);

    StudentIdentity::create([
        'registration_id' => $registration->id,
        'school_name' => 'SD Test',
        'district' => 'Kepenuhan',
        'full_name' => 'Budi Test',
        'gender' => 'L',
        'nik' => '1234567890123456',
        'kk_number' => '6543210987654321',
        'birth_place' => 'Kepenuhan',
        'birth_date' => '2018-04-12',
        'has_special_needs' => false,
        'religion' => 'islam',
        'dusun_name' => 'Dusun Contoh',
        'kelurahan_name' => 'Kel. Contoh',
        'address' => 'Jl. Mawar No. 1',
        'rt' => '01',
        'rw' => '02',
        'postal_code' => '28557',
        'residence_type' => 'orang_tua',
        'transportation' => 'jalan_kaki',
        'child_order' => 1,
        'phone_wa' => $phoneWa ?? $user->phone,
        'is_kps_kph_recipient' => false,
        'has_kip' => false,
    ]);

    Storage::disk('public')->put($registration->pdf_path, 'fake-pdf-content');

    return $registration->fresh(['identity', 'user']);
}

test('owner download triggers print instruction job on first call', function () {
    Bus::fake();

    $registration = makeSubmittedRegistration();

    $this->actingAs($registration->user)
        ->get(route('registration.pdf', ['registration' => $registration->id]))
        ->assertOk();

    Bus::assertDispatched(SendPrintInstructionNotification::class, function ($job) use ($registration) {
        return $job->registrationId === $registration->id;
    });
});

test('second download does not re-dispatch when log already sent', function () {
    Bus::fake();

    $registration = makeSubmittedRegistration();

    // Seed log sebagai SENT, simulasi notif sebelumnya sudah berhasil terkirim.
    WhatsappLog::create([
        'to' => $registration->identity->phone_wa,
        'type' => 'text',
        'purpose' => SendPrintInstructionNotification::PURPOSE,
        'message' => 'instruksi cetak '.$registration->registration_number,
        'status' => WhatsappLog::STATUS_SENT,
    ]);

    $this->actingAs($registration->user)
        ->get(route('registration.pdf', ['registration' => $registration->id]))
        ->assertOk();

    Bus::assertNotDispatched(SendPrintInstructionNotification::class);
});

test('public status pdf download does not trigger print instruction', function () {
    Bus::fake();

    $registration = makeSubmittedRegistration();

    $this->get(route('registration.public-pdf', [
        'registration_number' => $registration->registration_number,
    ]))->assertOk();

    Bus::assertNotDispatched(SendPrintInstructionNotification::class);
});

test('download after status accepted does not trigger print instruction', function () {
    Bus::fake();

    $registration = makeSubmittedRegistration(Registration::STATUS_ACCEPTED);

    $this->actingAs($registration->user)
        ->get(route('registration.pdf', ['registration' => $registration->id]))
        ->assertOk();

    Bus::assertNotDispatched(SendPrintInstructionNotification::class);
});

test('admin downloading user pdf does not trigger print instruction', function () {
    Bus::fake();

    $registration = makeSubmittedRegistration();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('registration.pdf', ['registration' => $registration->id]))
        ->assertOk();

    Bus::assertNotDispatched(SendPrintInstructionNotification::class);
});

test('verified status still allows print instruction dispatch', function () {
    Bus::fake();

    $registration = makeSubmittedRegistration(Registration::STATUS_VERIFIED);

    $this->actingAs($registration->user)
        ->get(route('registration.pdf', ['registration' => $registration->id]))
        ->assertOk();

    Bus::assertDispatched(SendPrintInstructionNotification::class);
});
