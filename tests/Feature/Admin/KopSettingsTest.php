<?php

use App\Models\SchoolSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can update kop settings and refresh cached pdf data', function () {
    $setting = SchoolSetting::current();
    $setting->update(['name' => 'Nama Sekolah Lama']);
    SchoolSetting::bust();
    expect(SchoolSetting::current()->name)->toBe('Nama Sekolah Lama');

    $this->actingAs(User::factory()->admin()->create())
        ->patch(route('admin.school-settings.update'), [
            'name' => 'SD SPMB Baru',
            'government_regency' => 'Pemerintah Kabupaten Baru',
            'education_office' => 'Dinas Pendidikan Baru',
            'address' => 'Jl. Pendidikan 1',
            'principal_name' => 'Kepala Sekolah Baru',
            'principal_nip' => '198001012005011001',
            'signature_city' => 'Kepenuhan',
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $this->get(route('admin.school-settings.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/SchoolSettings/Edit')
            ->where('setting.name', 'SD SPMB Baru')
            ->where('setting.principal_name', 'Kepala Sekolah Baru'));

    $pdfData = SchoolSetting::current()->toPdfArray();
    expect($pdfData['name'])->toBe('SD SPMB Baru')
        ->and($pdfData['government_regency'])->toBe('Pemerintah Kabupaten Baru')
        ->and($pdfData['principal_nip'])->toBe('198001012005011001');
});

test('admin can upload both kop logos through the form submission', function () {
    Storage::fake('public');

    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.school-settings.update'), [
            '_method' => 'patch',
            'name' => 'SD SPMB',
            'logo' => UploadedFile::fake()->image('school.png'),
            'regency_logo' => UploadedFile::fake()->image('regency.png'),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $setting = SchoolSetting::current();
    expect($setting->logo_path)->not->toBeNull()
        ->and($setting->regency_logo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($setting->logo_path);
    Storage::disk('public')->assertExists($setting->regency_logo_path);
});

test('admin can remove a kop logo without deleting the other logo', function (string $field, string $routeName, string $otherField) {
    Storage::fake('public');
    $setting = SchoolSetting::current();
    $setting->update([
        'logo_path' => 'school/logo.png',
        'regency_logo_path' => 'school/regency-logo.png',
    ]);
    Storage::disk('public')->put($setting->logo_path, 'school logo');
    Storage::disk('public')->put($setting->regency_logo_path, 'regency logo');
    SchoolSetting::bust();
    SchoolSetting::current();
    $removedPath = $setting->{$field};
    $retainedPath = $setting->{$otherField};

    $this->actingAs(User::factory()->admin()->create())
        ->delete(route($routeName))
        ->assertRedirect();

    expect(SchoolSetting::current()->{$field})->toBeNull()
        ->and(SchoolSetting::current()->{$otherField})->toBe($retainedPath);
    Storage::disk('public')->assertMissing($removedPath);
    Storage::disk('public')->assertExists($retainedPath);
})->with([
    'school logo' => ['logo_path', 'admin.school-settings.logo.destroy', 'regency_logo_path'],
    'regency logo' => ['regency_logo_path', 'admin.school-settings.regency-logo.destroy', 'logo_path'],
]);
