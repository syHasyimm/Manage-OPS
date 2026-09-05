<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendStudentNotification;
use App\Models\NotificationTemplate;
use App\Models\SchoolSetting;
use App\Models\Student;
use App\Models\StudentNotification;
use App\Support\NotificationTemplates;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class StudentNotificationController extends Controller
{
    public const RESULT_KEY = 'admin.student_notifications.result';

    public function index(Request $request): Response
    {
        $query = StudentNotification::query()
            ->with(['student', 'template', 'sender'])
            ->latest('id');

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($builder) use ($search) {
                $builder->where('student_name', 'like', "%{$search}%")
                    ->orWhere('target_phone', 'like', "%{$search}%")
                    ->orWhereHas('student', fn ($student) => $student
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('nis', 'like', "%{$search}%"));
            });
        }

        $notifications = $query->paginate(20)->withQueryString();
        $notifications->getCollection()->transform(fn (StudentNotification $notification) => $this->notificationResource($notification));

        return Inertia::render('Admin/Notifications/Index', [
            'notifications' => $notifications,
            'filters' => $request->only(['q', 'category', 'status']),
            'categories' => NotificationTemplates::categories(),
            'statuses' => [
                StudentNotification::STATUS_PENDING => 'Menunggu',
                StudentNotification::STATUS_SENT => 'Terkirim',
                StudentNotification::STATUS_FAILED => 'Gagal',
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Notifications/Create', [
            'templates' => NotificationTemplate::query()
                ->orderBy('category')
                ->orderBy('name')
                ->get(['id', 'category', 'name', 'body']),
            'categories' => NotificationTemplates::categories(),
            'variables' => NotificationTemplates::variableDefinitions(),
            'grades' => range(1, 6),
            'school_name' => SchoolSetting::current()->name ?: config('spmb.school.name', 'Sekolah'),
            'result' => $request->session()->pull(self::RESULT_KEY),
        ]);
    }

    public function searchStudents(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q'));

        if (mb_strlen($search) < 2) {
            return response()->json([]);
        }

        $students = Student::query()
            ->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%")
                    ->orWhere('nisn', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json($students->map(fn (Student $student) => $this->studentResource($student)));
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'delivery_mode' => ['required', Rule::in(['individual', 'class'])],
            'student_id' => [
                Rule::requiredIf(fn () => $request->input('delivery_mode') === 'individual'),
                'nullable',
                'integer',
                'exists:students,id',
            ],
            'tingkat' => [
                Rule::requiredIf(fn () => $request->input('delivery_mode') === 'class'),
                'nullable',
                'integer',
                'between:1,6',
            ],
            'rombel' => ['nullable', 'string', 'max:1', 'regex:/^[A-Za-z]$/'],
            'category' => ['required', Rule::in(array_keys(NotificationTemplates::categories()))],
            'template_id' => ['required', 'integer', 'exists:notification_templates,id'],
            'variables' => ['nullable', 'array'],
            'variables.*' => ['nullable', 'string', 'max:5000'],
        ]);

        $template = NotificationTemplate::query()->find($data['template_id']);

        if (! $template || $template->category !== $data['category']) {
            throw ValidationException::withMessages([
                'template_id' => 'Template tidak sesuai dengan kategori yang dipilih.',
            ]);
        }

        $manualVariables = $this->validatedManualVariables($data['category'], $data['variables'] ?? []);
        $schoolName = SchoolSetting::current()->name ?: config('spmb.school.name', 'Sekolah');
        $candidates = [];
        $skipped = [];

        if ($data['delivery_mode'] === 'individual') {
            $student = Student::query()->findOrFail($data['student_id']);
            $this->ensureStudentContact($student);
            $candidates[] = $student;
        } else {
            $query = Student::query()->where('kelas', 'like', ((int) $data['tingkat']).'%');

            if (! empty($data['rombel'])) {
                $query->where('kelas', ((int) $data['tingkat']).strtoupper($data['rombel']));
            }

            $students = $query->orderBy('name')->get();

            foreach ($students as $student) {
                if (! $student->parent_phone || ! $student->parent_name) {
                    $missing = [];

                    if (! $student->parent_phone) {
                        $missing[] = 'No HP ortu';
                    }

                    if (! $student->parent_name) {
                        $missing[] = 'Nama ortu';
                    }

                    $skipped[] = [
                        'student_id' => $student->id,
                        'name' => $student->name,
                        'reason' => implode(' dan ', $missing).' belum lengkap.',
                    ];

                    continue;
                }

                $candidates[] = $student;
            }

            if (! $students->count()) {
                throw ValidationException::withMessages([
                    'tingkat' => 'Tidak ada siswa pada kelas yang dipilih.',
                ]);
            }
        }

        if (! $candidates) {
            throw ValidationException::withMessages([
                'tingkat' => 'Tidak ada siswa yang memiliki data ortu lengkap untuk dikirimi notifikasi.',
            ]);
        }

        $batchId = $data['delivery_mode'] === 'class' ? (string) Str::uuid() : null;
        $notificationIds = [];

        DB::transaction(function () use ($candidates, $template, $manualVariables, $schoolName, $batchId, &$notificationIds) {
            foreach ($candidates as $student) {
                $variables = array_merge([
                    'nama_siswa' => $student->name,
                    'kelas' => $student->kelas,
                    'nama_ortu' => $student->parent_name,
                    'nama_sekolah' => $schoolName,
                ], $manualVariables);

                try {
                    $finalMessage = NotificationTemplates::render($template->category, $template->body, $variables);
                } catch (InvalidArgumentException $exception) {
                    throw ValidationException::withMessages([
                        'variables' => $exception->getMessage(),
                    ]);
                }

                $notification = StudentNotification::create([
                    'student_id' => $student->id,
                    'template_id' => $template->id,
                    'sent_by' => request()->user()->id,
                    'category' => $template->category,
                    'student_name' => $student->name,
                    'template_name' => $template->name,
                    'variables' => $variables,
                    'final_message' => $finalMessage,
                    'target_phone' => $student->parent_phone,
                    'status' => StudentNotification::STATUS_PENDING,
                    'batch_id' => $batchId,
                ]);

                $notificationIds[] = $notification->id;
            }
        });

        foreach ($notificationIds as $notificationId) {
            SendStudentNotification::dispatch($notificationId);
        }

        $result = [
            'mode' => $data['delivery_mode'],
            'queued' => count($notificationIds),
            'skipped' => $skipped,
        ];
        $message = count($skipped)
            ? "{$result['queued']} notifikasi masuk antrean; ".count($skipped).' siswa dilewati karena data ortu belum lengkap.'
            : "{$result['queued']} notifikasi masuk antrean pengiriman.";

        return back()
            ->with('status', $message)
            ->with(self::RESULT_KEY, $result);
    }

    public function retry(StudentNotification $studentNotification): RedirectResponse
    {
        if ($studentNotification->status !== StudentNotification::STATUS_FAILED) {
            return back()->with('error', 'Hanya notifikasi berstatus gagal yang dapat dikirim ulang.');
        }

        $studentNotification->update([
            'status' => StudentNotification::STATUS_PENDING,
            'error' => null,
            'sent_at' => null,
        ]);

        SendStudentNotification::dispatch($studentNotification->id);

        return back()->with('status', 'Notifikasi dijadwalkan untuk dikirim ulang.');
    }

    protected function validatedManualVariables(string $category, array $variables): array
    {
        $errors = [];

        foreach (NotificationTemplates::manualVariables($category) as $key => $definition) {
            if (! isset($variables[$key]) || trim((string) $variables[$key]) === '') {
                $errors["variables.{$key}"] = "{$definition['label']} wajib diisi.";
            }
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        return array_map(fn ($value) => trim((string) $value), $variables);
    }

    protected function ensureStudentContact(Student $student): void
    {
        $missing = [];

        if (! $student->parent_phone) {
            $missing[] = 'No HP ortu';
        }

        if (! $student->parent_name) {
            $missing[] = 'Nama Ortu';
        }

        if ($missing) {
            throw ValidationException::withMessages([
                'student_id' => 'Siswa belum memiliki '.implode(' dan ', $missing).'.',
            ]);
        }
    }

    protected function studentResource(Student $student): array
    {
        return [
            'id' => $student->id,
            'name' => $student->name,
            'nis' => $student->nis,
            'nisn' => $student->nisn,
            'kelas' => $student->kelas,
            'parent_name' => $student->parent_name,
            'parent_phone' => $student->parent_phone,
        ];
    }

    protected function notificationResource(StudentNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'student_id' => $notification->student_id,
            'student_name' => $notification->student_name,
            'student_nis' => $notification->student?->nis,
            'template_name' => $notification->template_name ?: $notification->template?->name,
            'category' => $notification->category,
            'category_label' => NotificationTemplates::categoryLabel($notification->category),
            'target_phone' => $notification->target_phone,
            'final_message' => $notification->final_message,
            'status' => $notification->status,
            'sent_at' => $notification->sent_at,
            'created_at' => $notification->created_at,
            'error' => $notification->error,
            'sender_name' => $notification->sender?->name,
            'batch_id' => $notification->batch_id,
        ];
    }
}
