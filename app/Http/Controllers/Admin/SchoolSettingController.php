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
                    'tagline',
                    'short_desc',
                    'principal_quote',
                    'vision',
                    'operating_hours',
                    'office_hours',
                    'maps_url',
                    'hero_image_path',
                    'principal_image_path',
                ]),
                [
                    'logo_url' => $setting->logoUrl(),
                    'regency_logo_url' => $setting->regencyLogoUrl(),
                    'principal_image_url' => $setting->principalImageUrl(),
                    'hero_image_url' => $setting->heroImageUrl(),
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
            'tagline' => ['nullable', 'string', 'max:255'],
            'short_desc' => ['nullable', 'string'],
            'principal_quote' => ['nullable', 'string'],
            'vision' => ['nullable', 'string'],
            'operating_hours' => ['nullable', 'string', 'max:100'],
            'office_hours' => ['nullable', 'string', 'max:100'],
            'maps_url' => ['nullable', 'string', 'max:500'],
            'principal_image' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
            'hero_image' => ['nullable', 'image', 'mimes:png,jpg,jpeg', 'max:2048'],
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

        if ($request->hasFile('principal_image')) {
            if ($setting->principal_image_path && Storage::disk('public')->exists($setting->principal_image_path)) {
                Storage::disk('public')->delete($setting->principal_image_path);
            }

            $file = $request->file('principal_image');
            $ext = $file->getClientOriginalExtension();
            $filename = 'principal-'.time().'.'.$ext;
            $path = $file->storeAs('school', $filename, 'public');

            $data['principal_image_path'] = $path;
        }

        if ($request->hasFile('hero_image')) {
            if ($setting->hero_image_path && Storage::disk('public')->exists($setting->hero_image_path)) {
                Storage::disk('public')->delete($setting->hero_image_path);
            }

            $file = $request->file('hero_image');
            $ext = $file->getClientOriginalExtension();
            $filename = 'hero-'.time().'.'.$ext;
            $path = $file->storeAs('school', $filename, 'public');

            $data['hero_image_path'] = $path;
        }

        unset($data['logo'], $data['regency_logo'], $data['principal_image'], $data['hero_image']);

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

    public function deletePrincipalImage(): RedirectResponse
    {
        $setting = SchoolSetting::current();

        if ($setting->principal_image_path) {
            if (Storage::disk('public')->exists($setting->principal_image_path)) {
                Storage::disk('public')->delete($setting->principal_image_path);
            }

            $setting->forceFill(['principal_image_path' => null])->save();
            SchoolSetting::bust();
        }

        return back()->with('status', 'Foto kepala sekolah dihapus.');
    }

    public function deleteHeroImage(): RedirectResponse
    {
        $setting = SchoolSetting::current();

        if ($setting->hero_image_path) {
            if (Storage::disk('public')->exists($setting->hero_image_path)) {
                Storage::disk('public')->delete($setting->hero_image_path);
            }

            $setting->forceFill(['hero_image_path' => null])->save();
            SchoolSetting::bust();
        }

        return back()->with('status', 'Gambar hero background dihapus.');
    }
}
