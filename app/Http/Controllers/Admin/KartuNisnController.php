<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesainKartuNisn;
use App\Models\Student;
use App\Models\SchoolSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class KartuNisnController extends Controller
{
    public function index(Request $request): Response
    {
        $desain = DesainKartuNisn::current();
        
        $query = Student::query()->latest('id');

        if ($tingkat = $request->query('tingkat')) {
            $query->where('kelas', 'like', ((int) $tingkat).'%');
        }

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        $students = $query->paginate(50)->withQueryString();
        $students->getCollection()->transform(function (Student $student) {
            $student->photo_url = $student->photoUrl();
            return $student;
        });

        return Inertia::render('Admin/KartuNisn/Index', [
            'desain' => [
                'id' => $desain->id,
                'warna_primary' => $desain->warna_primary,
                'nama_sekolah' => $desain->nama_sekolah,
                'alamat_sekolah' => $desain->alamat_sekolah,
                'logo_sekolah' => $desain->logo_sekolah ? Storage::disk('public')->url($desain->logo_sekolah) : null,
                'logo_nisn' => $desain->logo_nisn ? Storage::disk('public')->url($desain->logo_nisn) : null,
                'logo_dapodik' => $desain->logo_dapodik ? Storage::disk('public')->url($desain->logo_dapodik) : null,
                'background_depan' => $desain->background_depan ? Storage::disk('public')->url($desain->background_depan) : null,
            ],
            'students' => $students,
            'filters' => $request->only(['q', 'tingkat']),
            'grades' => range(1, 6),
        ]);
    }

    public function updateDesain(Request $request)
    {
        $data = $request->validate([
            'warna_primary' => ['required', 'string', 'max:7'],
            'nama_sekolah' => ['required', 'string', 'max:200'],
            'alamat_sekolah' => ['required', 'string'],
            'logo_sekolah' => ['nullable', 'image', 'max:1024'],
            'logo_nisn' => ['nullable', 'image', 'max:1024'],
            'logo_dapodik' => ['nullable', 'image', 'max:1024'],
            'background_depan' => ['nullable', 'image', 'max:2048'],
        ]);

        $desain = DesainKartuNisn::current();
        
        $fields = ['logo_sekolah', 'logo_nisn', 'logo_dapodik', 'background_depan'];
        
        foreach ($fields as $field) {
            if ($request->hasFile($field)) {
                if ($desain->$field) {
                    Storage::disk('public')->delete($desain->$field);
                }
                $extension = $request->file($field)->extension() ?: 'png';
                $filename = $field . '_' . Str::random(10) . '.' . $extension;
                $data[$field] = $request->file($field)->storeAs('kartu_nisn', $filename, 'public');
            } else {
                unset($data[$field]);
            }
        }

        $desain->update($data);

        return back()->with('status', 'Desain kartu berhasil diperbarui.');
    }

    public function deleteAsset($field)
    {
        $validFields = ['logo_sekolah', 'logo_nisn', 'logo_dapodik', 'background_depan'];
        
        if (!in_array($field, $validFields)) {
            abort(400, 'Invalid field');
        }

        $desain = DesainKartuNisn::current();
        
        if ($desain->$field) {
            Storage::disk('public')->delete($desain->$field);
            $desain->update([$field => null]);
        }

        return back()->with('status', 'Aset berhasil dihapus.');
    }

    public function print(Request $request)
    {
        $request->validate([
            'student_ids' => ['nullable', 'array'],
            'student_ids.*' => ['exists:students,id'],
            'tingkat' => ['nullable', 'integer', 'between:1,6'],
        ]);

        $desain = DesainKartuNisn::current();
        $query = Student::query()->orderBy('name');

        if ($request->filled('student_ids')) {
            $query->whereIn('id', $request->student_ids);
        } elseif ($request->filled('tingkat')) {
            $query->where('kelas', 'like', $request->tingkat . '%');
        } else {
            // Jika tidak ada filter, cetak semua. Batasi agar tidak terlalu berat jika murid banyak sekali.
             $query->take(500); 
        }

        $students = $query->get();
        
        if ($students->isEmpty()) {
            return back()->with('error', 'Tidak ada data siswa untuk dicetak.');
        }

        $kartus = $students->map(function($student) use ($desain) {
            // Create a DTO that matches the structure expected by the blade template
            $siswaDto = new \stdClass();
            $siswaDto->nama = $student->name;
            $siswaDto->nis = $student->nis;
            $siswaDto->nisn = $student->nisn;
            $siswaDto->kelas = $student->kelas;
            $siswaDto->tempat_lahir = $student->birth_place;
            $siswaDto->tanggal_lahir = $student->birth_date; // This is a Carbon instance in Student model
            $siswaDto->alamat = $student->address;
            $siswaDto->tahun_ajaran = SchoolSetting::current()->academic_year ?? '2023/2024'; // Or get from active period
            $siswaDto->foto = $student->photo_path;

            $kartu = new \stdClass();
            $kartu->siswa = $siswaDto;
            $kartu->desainCard = $desain;
            return $kartu;
        });

        $pdf = Pdf::loadView('pdf.kartu', [
            'kartus' => $kartus
        ])
        ->setPaper([0, 0, 612.00, 936.00], 'portrait') // Kertas Legal/F4 (215.9mm x 330.2mm)
        ->setOption(['isPhpEnabled' => true, 'isRemoteEnabled' => true]);

        return $pdf->download("kartu-nisn-" . now()->format('Ymd-His') . ".pdf");
    }
}
