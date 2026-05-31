<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SchoolSettingController extends Controller
{
    public function edit(): Response
    {
        $setting = SchoolSetting::current();

        return Inertia::render('Admin/SchoolSettings/Edit', [
            'setting' => array_merge(
                $setting->only([
                    'id',
                    'government_regency',
                    'education_office',
                    'name',
                    'npsn',
                    'nss',
                    'accreditation',
                    'address',
                    'village',
                    'district',
                    'regency',
                    'province',
                    'postal_code',
                    'phone',
                    'email',
                    'website',
                    'principal_name',
                    'principal_nip',
                    'principal_title',
                    'signature_city',
                    'logo_path',
                    'regency_logo_path',
                ]),
                [
                    'logo_url' => $setting->logoUrl(),
                    'regency_logo_url' => $setting->regencyLogoUrl(),
                ],
            ),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'npsn' => ['nullable', 'string', 'max:20'],
            'nss' => ['nullable', 'string', 'max:20'],
            'accreditation' => ['nullable', 'string', 'max:5'],
            'government_regency' => ['nullable', 'string', 'max:100'],
            'education_office' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:255'],
            'village' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'regency' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:100'],
            'website' => ['nullable', 'string', 'max:150'],
            'principal_name' => ['nullable', 'string', 'max:100'],
            'principal_nip' => ['nullable', 'string', 'max:30'],
            'principal_title' => ['nullable', 'string', 'max:100'],
            'signature_city' => ['nullable', 'string', 'max:100'],
            'logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:1024'],
            'regency_logo' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:1024'],
        ]);

        $setting = SchoolSetting::current();

        if ($request->hasFile('logo')) {
            if ($setting->logo_path && Storage::disk('public')->exists($setting->logo_path)) {
                Storage::disk('public')->delete($setting->logo_path);
            }

            $file = $request->file('logo');
            $ext = $file->getClientOriginalExtension();
            $filename = 'logo-'.time().'.'.$ext;
            $path = $file->storeAs('school', $filename, 'public');

            $data['logo_path'] = $path;
        }

        if ($request->hasFile('regency_logo')) {
            if ($setting->regency_logo_path && Storage::disk('public')->exists($setting->regency_logo_path)) {
                Storage::disk('public')->delete($setting->regency_logo_path);
            }

            $file = $request->file('regency_logo');
            $ext = $file->getClientOriginalExtension();
            $filename = 'regency-logo-'.time().'.'.$ext;
            $path = $file->storeAs('school', $filename, 'public');

            $data['regency_logo_path'] = $path;
        }

        unset($data['logo'], $data['regency_logo']);

        $setting->fill($data)->save();

        SchoolSetting::bust();

        return back()->with('status', 'Pengaturan sekolah berhasil diperbarui.');
    }

    public function deleteLogo(): RedirectResponse
    {
        $setting = SchoolSetting::current();

        if ($setting->logo_path) {
            if (Storage::disk('public')->exists($setting->logo_path)) {
                Storage::disk('public')->delete($setting->logo_path);
            }

            $setting->forceFill(['logo_path' => null])->save();
            SchoolSetting::bust();
        }

        return back()->with('status', 'Logo sekolah dihapus.');
    }

    public function deleteRegencyLogo(): RedirectResponse
    {
        $setting = SchoolSetting::current();

        if ($setting->regency_logo_path) {
            if (Storage::disk('public')->exists($setting->regency_logo_path)) {
                Storage::disk('public')->delete($setting->regency_logo_path);
            }

            $setting->forceFill(['regency_logo_path' => null])->save();
            SchoolSetting::bust();
        }

        return back()->with('status', 'Logo kabupaten dihapus.');
    }
}
