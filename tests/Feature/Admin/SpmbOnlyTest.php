<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('admin pages contain only the supported spmb modules', function () {
    $admin = User::factory()->admin()->create();

    foreach ([
        '/admin/dashboard' => 'Admin/Dashboard',
        '/admin/periods' => 'Admin/Periods/Index',
        '/admin/registrations' => 'Admin/Registrations/Index',
        '/admin/school-settings' => 'Admin/SchoolSettings/Edit',
        '/admin/faqs' => 'Admin/Faqs/Index',
    ] as $uri => $component) {
        $this->actingAs($admin)
            ->get($uri)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component($component));
    }

    $adminRoutes = collect(Route::getRoutes())
        ->filter(fn ($route) => str_starts_with($route->getName() ?? '', 'admin.'));

    expect($adminRoutes)->not->toBeEmpty();

    foreach ($adminRoutes as $route) {
        expect($route->getName())->toMatch('/^admin\\.(dashboard|periods\\.[a-z-]+|registrations\\.[a-z-]+|school-settings\\.[a-z.-]+|faqs\\.[a-z-]+)$/');
        expect($route->gatherMiddleware())->toContain('auth', 'admin');
    }
});

test('removed admin endpoints are inaccessible even to an admin', function (string $uri) {
    $this->actingAs(User::factory()->admin()->create());

    foreach (['get', 'post', 'patch', 'delete'] as $method) {
        $this->{$method}($uri)->assertNotFound();
    }
})->with([
    'students' => '/admin/students',
    'student import' => '/admin/students/import',
    'student photos' => '/admin/students/import-photos',
    'staff' => '/admin/staff',
    'staff export' => '/admin/staff/export',
    'nisn cards' => '/admin/kartu-nisn',
    'nisn printing' => '/admin/kartu-nisn/print',
    'assignment letters' => '/admin/surat-tugas',
    'assignment pdf' => '/admin/surat-tugas/download',
    'travel orders' => '/admin/sppd',
    'travel pdf' => '/admin/sppd/download',
    'graduation letters' => '/admin/graduation-letters',
    'graduation import' => '/admin/graduation-letters/import',
    'documents' => '/admin/documents',
    'notifications' => '/admin/notifications',
    'notification templates' => '/admin/notification-templates',
    'users' => '/admin/users',
    'school calendar' => '/admin/academic-calendars',
    'school calendar update' => '/admin/academic-calendars/1',
    'teacher contacts' => '/admin/teacher-contacts',
    'teacher contact update' => '/admin/teacher-contacts/1',
    'whatsapp settings' => '/admin/whatsapp-settings',
    'whatsapp connection test' => '/admin/whatsapp-settings/test',
    'calendar reminders' => '/admin/calendar-reminders',
    'calendar reminder retry' => '/admin/calendar-reminders/1/retry',
]);

test('spmb admin pages require an administrator', function (string $uri) {
    $this->get($uri)->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create(['phone_verified_at' => now()]))
        ->get($uri)
        ->assertForbidden();
})->with([
    '/admin/dashboard',
    '/admin/periods',
    '/admin/registrations',
    '/admin/school-settings',
    '/admin/faqs',
]);
