<?php

use App\Http\Controllers\Admin\StudentController;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

function studentAdmin(): User
{
    return User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);
}

function studentWorkbook(array $rows): UploadedFile
{
    $spreadsheet = new Spreadsheet;
    $spreadsheet->getActiveSheet()->fromArray([
        ['Nama', 'NIS', 'NISN', 'NIK', 'Tempat Lahir', 'Tanggal Lahir', 'Agama', 'Alamat', 'No Ortu', 'Nama Ortu', 'Kelas'],
        ...$rows,
    ]);

    $path = tempnam(sys_get_temp_dir(), 'students-');
    (new Xlsx($spreadsheet))->save($path);
    $spreadsheet->disconnectWorksheets();

    return new UploadedFile(
        $path,
        'data-siswa.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        null,
        true,
    );
}

test('only admins can access student data', function () {
    $user = User::factory()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('admin.students.index'))
        ->assertForbidden();

    $this->actingAsGuest()
        ->get(route('admin.students.index'))
        ->assertRedirect(route('login'));
});

test('admin can save a student manually with an optional photo', function () {
    Storage::fake('public');
    $admin = studentAdmin();

    $this->actingAs($admin)
        ->post(route('admin.students.store'), [
            'name' => 'Budi Santoso',
            'nis' => 'NIS001',
            'nisn' => '1234567890',
            'nik' => '1234567890123456',
            'birth_place' => 'Kepenuhan',
            'birth_date' => '2018-01-01',
            'gender' => 'L',
            'religion' => 'islam',
            'address' => 'Jalan Pendidikan',
            'parent_phone' => '081234567890',
            'parent_name' => 'Bapak Budi',
            'tingkat' => '1',
            'rombel' => 'a',
            'photo' => UploadedFile::fake()->image('budi.jpg'),
        ])
        ->assertRedirect(route('admin.students.index'));

    $student = Student::query()->firstOrFail();

    expect($student->kelas)->toBe('1A')
        ->and($student->birth_date->format('Y-m-d'))->toBe('2018-01-01')
        ->and($student->photo_path)->not->toBeNull();

    Storage::disk('public')->assertExists($student->photo_path);
});

test('invalid student identity fields are rejected', function () {
    $admin = studentAdmin();

    $this->actingAs($admin)
        ->post(route('admin.students.store'), [
            'name' => 'Siswa Invalid',
            'nis' => 'NIS002',
            'nisn' => '123',
            'nik' => '123',
            'birth_place' => 'Kepenuhan',
            'birth_date' => '2018-01-01',
            'religion' => 'islam',
            'address' => 'Jalan Pendidikan',
            'parent_phone' => 'invalid-phone',
            'parent_name' => 'Ortu Invalid',
            'tingkat' => '7',
            'rombel' => '',
        ])
        ->assertSessionHasErrors(['nisn', 'nik', 'tingkat', 'parent_phone']);

    expect(Student::query()->count())->toBe(0);
});

test('valid Excel rows are imported while duplicate rows are reported', function () {
    $admin = studentAdmin();
    Student::create([
        'name' => 'Siswa Lama',
        'nis' => 'NIS001',
        'nisn' => '1234567890',
        'nik' => '1234567890123456',
        'birth_place' => 'Kepenuhan',
        'birth_date' => '2018-01-01',
        'religion' => 'islam',
        'address' => 'Alamat lama',
        'kelas' => '1A',
    ]);

    $file = studentWorkbook([
        ['Siswa Baru', 'NIS002', '1234567891', '1234567890123457', 'Pasir Pandak', '2017-02-02', 'Islam', 'Alamat baru', '081234567891', 'Bapak Baru', '2B'],
        ['Duplikat', 'NIS001', '1234567892', '1234567890123458', 'Kepenuhan', '2017-03-03', 'islam', 'Alamat duplikat', '081234567892', 'Bapak Duplikat', '2A'],
    ]);

    $this->actingAs($admin)
        ->post(route('admin.students.import.store'), ['file' => $file])
        ->assertRedirect(route('admin.students.import.create'))
        ->assertSessionHas(StudentController::IMPORT_RESULT_KEY, function (array $result) {
            return $result['status'] === 'success'
                && $result['imported'] === 1
                && count($result['duplicate_rows']) === 1;
        });

    expect(Student::query()->where('nis', 'NIS002')->exists())->toBeTrue()
        ->and(Student::query()->where('name', 'Duplikat')->exists())->toBeFalse();
});

test('any invalid Excel row cancels the whole import', function () {
    $admin = studentAdmin();

    $file = studentWorkbook([
        ['Siswa Valid', 'NIS003', '1234567893', '1234567890123459', 'Kepenuhan', '2017-04-04', 'islam', 'Alamat valid', '081234567893', 'Bapak Valid', '3'],
        ['Siswa Invalid', 'NIS004', '123', '123', 'Kepenuhan', '2017-05-05', 'islam', 'Alamat invalid', '081234567894', 'Bapak Invalid', '4A'],
    ]);

    $this->actingAs($admin)
        ->post(route('admin.students.import.store'), ['file' => $file])
        ->assertRedirect(route('admin.students.import.create'))
        ->assertSessionHas(StudentController::IMPORT_RESULT_KEY, function (array $result) {
            return $result['status'] === 'failed'
                && $result['imported'] === 0
                && count($result['invalid_rows']) === 1;
        });

    expect(Student::query()->count())->toBe(0);
});

test('admin can download the student import template', function () {
    $admin = studentAdmin();

    $response = $this->actingAs($admin)
        ->get(route('admin.students.template'));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('spreadsheetml.sheet');
});

test('deleting a student also deletes the stored photo', function () {
    Storage::fake('public');
    $admin = studentAdmin();
    $photoPath = 'students/student-photo.jpg';
    Storage::disk('public')->put($photoPath, 'photo');
    $student = Student::create([
        'name' => 'Siswa Hapus',
        'nis' => 'NIS005',
        'nisn' => '1234567894',
        'nik' => '1234567890123460',
        'birth_place' => 'Kepenuhan',
        'birth_date' => '2017-06-06',
        'religion' => 'islam',
        'address' => 'Alamat siswa',
        'parent_phone' => '081234567895',
        'parent_name' => 'Bapak Hapus',
        'kelas' => '5A',
        'photo_path' => $photoPath,
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.students.destroy', ['student' => $student->id]))
        ->assertRedirect();

    expect(Student::query()->find($student->id))->toBeNull();
    Storage::disk('public')->assertMissing($photoPath);
});
