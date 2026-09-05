<?php

use App\Http\Controllers\Admin\StudentNotificationController;
use App\Jobs\SendStudentNotification;
use App\Models\AppSetting;
use App\Models\NotificationTemplate;
use App\Models\Student;
use App\Models\StudentNotification;
use App\Models\User;
use App\Models\WhatsappLog;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use App\Support\NotificationTemplates;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

function notificationAdmin(): User
{
    return User::factory()->admin()->create([
        'phone_verified_at' => now(),
    ]);
}

function notificationStudent(array $overrides = []): Student
{
    static $sequence = 0;
    $sequence++;

    return Student::create(array_merge([
        'name' => 'Siswa '.$sequence,
        'nis' => 'NIS-NOTIF-'.$sequence,
        'nisn' => str_pad((string) (1234500000 + $sequence), 10, '0', STR_PAD_LEFT),
        'nik' => str_pad((string) (320100000000000 + $sequence), 16, '0', STR_PAD_LEFT),
        'birth_place' => 'Kepenuhan',
        'birth_date' => '2017-01-01',
        'religion' => 'islam',
        'address' => 'Alamat siswa',
        'parent_phone' => '081234567890',
        'parent_name' => 'Bapak/Ibu '.$sequence,
        'kelas' => '3A',
    ], $overrides));
}

function notificationTemplate(string $category = NotificationTemplates::CATEGORY_INVITATION): NotificationTemplate
{
    $default = collect(NotificationTemplates::defaultTemplates())->firstWhere('category', $category);

    return NotificationTemplate::create([
        'category' => $category,
        'name' => 'Template Test '.uniqid(),
        'body' => $default['body'],
    ]);
}

function notificationVariables(): array
{
    return [
        'nama_acara' => 'Rapat Orang Tua',
        'tanggal' => 'Senin, 1 September 2026',
        'jam' => '09.00 WIB',
        'tempat' => 'Aula Sekolah',
    ];
}

test('only admins can access student notifications', function () {
    $user = User::factory()->create([
        'phone_verified_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('admin.notifications.index'))
        ->assertForbidden();

    $this->actingAsGuest()
        ->get(route('admin.notifications.create'))
        ->assertRedirect(route('login'));
});

test('admin can manage notification templates and unknown placeholders are rejected', function () {
    $admin = notificationAdmin();

    $this->actingAs($admin)
        ->post(route('admin.notification-templates.store'), [
            'category' => NotificationTemplates::CATEGORY_INVITATION,
            'name' => 'Undangan Test',
            'body' => 'Halo {{nama_siswa}} di {{nama_sekolah}}.',
        ])
        ->assertRedirect();

    $template = NotificationTemplate::query()->where('name', 'Undangan Test')->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.notification-templates.update', $template->id), [
            'category' => NotificationTemplates::CATEGORY_INVITATION,
            'name' => 'Undangan Test Updated',
            'body' => 'Halo {{nama_siswa}}.',
        ])
        ->assertRedirect();

    expect($template->fresh()->name)->toBe('Undangan Test Updated');

    $this->actingAs($admin)
        ->post(route('admin.notification-templates.store'), [
            'category' => NotificationTemplates::CATEGORY_INVITATION,
            'name' => 'Template Invalid',
            'body' => 'Halo {{placeholder_tidak_dikenal}}.',
        ])
        ->assertSessionHasErrors('body');

    $this->actingAs($admin)
        ->delete(route('admin.notification-templates.destroy', $template->id))
        ->assertRedirect();

    expect(NotificationTemplate::query()->find($template->id))->toBeNull();
});

test('admin can queue an individual notification with a rendered snapshot', function () {
    Queue::fake();
    $admin = notificationAdmin();
    $student = notificationStudent();
    $template = notificationTemplate();

    $this->actingAs($admin)
        ->post(route('admin.notifications.store'), [
            'delivery_mode' => 'individual',
            'student_id' => $student->id,
            'category' => $template->category,
            'template_id' => $template->id,
            'variables' => notificationVariables(),
        ])
        ->assertRedirect()
        ->assertSessionHas('status');

    $notification = StudentNotification::query()->firstOrFail();

    expect($notification->student_id)->toBe($student->id)
        ->and($notification->sent_by)->toBe($admin->id)
        ->and($notification->status)->toBe(StudentNotification::STATUS_PENDING)
        ->and($notification->target_phone)->toBe('081234567890')
        ->and($notification->final_message)->toContain('Bapak/Ibu 1')
        ->and($notification->final_message)->toContain('Rapat Orang Tua')
        ->and($notification->final_message)->not->toContain('{{');

    Queue::assertPushed(SendStudentNotification::class, fn (SendStudentNotification $job) => $job->notificationId === $notification->id);
});

test('individual notifications require complete parent contact data', function () {
    $admin = notificationAdmin();
    $student = notificationStudent([
        'parent_name' => null,
        'parent_phone' => null,
    ]);
    $template = notificationTemplate();

    $this->actingAs($admin)
        ->post(route('admin.notifications.store'), [
            'delivery_mode' => 'individual',
            'student_id' => $student->id,
            'category' => $template->category,
            'template_id' => $template->id,
            'variables' => notificationVariables(),
        ])
        ->assertSessionHasErrors('student_id');

    expect(StudentNotification::query()->count())->toBe(0);
});

test('class broadcast queues complete students and reports incomplete students', function () {
    Queue::fake();
    $admin = notificationAdmin();
    notificationStudent(['kelas' => '4A']);
    notificationStudent(['kelas' => '4A']);
    $skipped = notificationStudent([
        'name' => 'Siswa Tanpa Ortu',
        'kelas' => '4A',
        'parent_name' => null,
    ]);
    $template = notificationTemplate();

    $this->actingAs($admin)
        ->post(route('admin.notifications.store'), [
            'delivery_mode' => 'class',
            'tingkat' => '4',
            'rombel' => 'A',
            'category' => $template->category,
            'template_id' => $template->id,
            'variables' => notificationVariables(),
        ])
        ->assertRedirect()
        ->assertSessionHas(StudentNotificationController::RESULT_KEY, function (array $result) use ($skipped) {
            return $result['mode'] === 'class'
                && $result['queued'] === 2
                && count($result['skipped']) === 1
                && $result['skipped'][0]['student_id'] === $skipped->id;
        });

    $notifications = StudentNotification::query()->get();

    expect($notifications)->toHaveCount(2)
        ->and($notifications->pluck('batch_id')->unique())->toHaveCount(1)
        ->and(StudentNotification::query()->where('student_id', $skipped->id)->exists())->toBeFalse();

    Queue::assertCount(2);
});

test('student notification job marks success and writes the WhatsApp log', function () {
    config([
        'whatsapp.driver' => 'fonnte',
        'whatsapp.drivers.fonnte.base_url' => 'https://api.fonnte.test',
    ]);
    AppSetting::set(AppSetting::FONNTE_TOKEN, 'database-token');
    Http::fake([
        'https://api.fonnte.test/*' => Http::response(['status' => true], 200),
    ]);
    $notification = StudentNotification::create([
        'student_id' => notificationStudent()->id,
        'sent_by' => notificationAdmin()->id,
        'category' => NotificationTemplates::CATEGORY_ANNOUNCEMENT,
        'student_name' => 'Siswa Job',
        'template_name' => 'Pengumuman',
        'variables' => ['isi_pengumuman' => 'Libur'],
        'final_message' => 'Pengumuman sekolah: Libur.',
        'target_phone' => '081234567890',
        'status' => StudentNotification::STATUS_PENDING,
    ]);

    (new SendStudentNotification($notification->id))->handle(app(WhatsAppService::class));

    expect($notification->fresh()->status)->toBe(StudentNotification::STATUS_SENT)
        ->and($notification->fresh()->sent_at)->not->toBeNull()
        ->and(WhatsappLog::query()->where('purpose', 'student-notification.'.$notification->id)->value('status'))
        ->toBe(WhatsappLog::STATUS_SENT);
});

test('failed student notification can be retried manually', function () {
    config([
        'whatsapp.driver' => 'fonnte',
        'whatsapp.drivers.fonnte.base_url' => 'https://api.fonnte.test',
    ]);
    AppSetting::set(AppSetting::FONNTE_TOKEN, 'database-token');
    Http::fake([
        'https://api.fonnte.test/*' => Http::response(['status' => false], 200),
    ]);
    $notification = StudentNotification::create([
        'student_id' => notificationStudent()->id,
        'sent_by' => notificationAdmin()->id,
        'category' => NotificationTemplates::CATEGORY_ANNOUNCEMENT,
        'student_name' => 'Siswa Gagal',
        'template_name' => 'Pengumuman',
        'variables' => [],
        'final_message' => 'Pesan gagal.',
        'target_phone' => '081234567890',
        'status' => StudentNotification::STATUS_PENDING,
    ]);

    expect(fn () => (new SendStudentNotification($notification->id))->handle(app(WhatsAppService::class)))
        ->toThrow(RuntimeException::class);
    expect($notification->fresh()->status)->toBe(StudentNotification::STATUS_FAILED);

    Queue::fake();
    $this->actingAs(notificationAdmin())
        ->post(route('admin.notifications.retry', $notification->id))
        ->assertRedirect()
        ->assertSessionHas('status');

    expect($notification->fresh()->status)->toBe(StudentNotification::STATUS_PENDING);
    Queue::assertPushed(SendStudentNotification::class, fn (SendStudentNotification $job) => $job->notificationId === $notification->id);
});
