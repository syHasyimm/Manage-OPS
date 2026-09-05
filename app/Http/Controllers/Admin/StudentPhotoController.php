<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use ZipArchive;

class StudentPhotoController extends Controller
{
    public const IMPORT_PHOTOS_RESULT_KEY = 'admin.students.import_photos.result';

    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Students/ImportPhotos', [
            'result' => $request->session()->pull(self::IMPORT_PHOTOS_RESULT_KEY),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:zip', 'max:102400'], // 100MB
        ]);

        $zipFile = $request->file('file');
        $zip = new ZipArchive;

        if ($zip->open($zipFile->path()) !== true) {
            return back()->withErrors(['file' => 'Tidak dapat membuka file ZIP.']);
        }

        $tempPath = storage_path('app/temp/photos_'.Str::uuid());
        if (! File::exists($tempPath)) {
            File::makeDirectory($tempPath, 0755, true);
        }

        $zip->extractTo($tempPath);
        $zip->close();

        $successCount = 0;
        $failedCount = 0;
        $details = [];

        $files = File::allFiles($tempPath);
        $manager = new ImageManager(new Driver);

        foreach ($files as $file) {
            $extension = strtolower($file->getExtension());

            // Abaikan file yang bukan gambar
            if (! in_array($extension, ['jpg', 'jpeg', 'png'])) {
                continue;
            }

            $nisn = trim($file->getFilenameWithoutExtension());

            $student = Student::where('nisn', $nisn)->first();

            if (! $student) {
                $failedCount++;
                $details[] = [
                    'nisn' => $nisn,
                    'status' => 'Gagal',
                    'reason' => 'Siswa dengan NISN ini tidak ditemukan.',
                ];

                continue;
            }

            try {
                // Hapus foto lama jika ada
                if ($student->photo_path && Storage::disk('public')->exists($student->photo_path)) {
                    Storage::disk('public')->delete($student->photo_path);
                }

                // Proses resize gambar
                $image = $manager->decode($file->getPathname());
                // Resize scale to max 800px width/height while maintaining aspect ratio
                $image->scaleDown(width: 800, height: 800);

                // Buat nama file unik
                $filename = Str::slug($student->nis).'-'.Str::uuid().'.'.$extension;
                $relativePath = 'students/'.$filename;
                $absolutePath = storage_path('app/public/'.$relativePath);

                // Ensure directory exists
                if (! File::exists(dirname($absolutePath))) {
                    File::makeDirectory(dirname($absolutePath), 0755, true);
                }

                // Simpan gambar
                $image->save($absolutePath);

                // Update database
                $student->update([
                    'photo_path' => $relativePath,
                ]);

                $successCount++;
                $details[] = [
                    'nisn' => $nisn,
                    'status' => 'Berhasil',
                    'reason' => 'Foto berhasil diperbarui.',
                ];
            } catch (\Exception $e) {
                $failedCount++;
                $details[] = [
                    'nisn' => $nisn,
                    'status' => 'Gagal',
                    'reason' => 'Gagal memproses foto: '.$e->getMessage(),
                ];
            }
        }

        // Cleanup
        File::deleteDirectory($tempPath);

        $result = [
            'status' => 'success',
            'imported' => $successCount,
            'failed' => $failedCount,
            'details' => $details,
            'message' => "Proses selesai. $successCount berhasil, $failedCount gagal.",
        ];

        return redirect()
            ->route('admin.students.import-photos.create')
            ->with(self::IMPORT_PHOTOS_RESULT_KEY, $result);
    }
}
