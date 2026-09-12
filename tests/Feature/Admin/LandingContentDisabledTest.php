<?php

use Illuminate\Support\Facades\Route;

test('landing content management routes are disabled in the admin area', function () {
    $removedRoutes = [
        'admin.school-missions.index',
        'admin.school-values.index',
        'admin.school-programs.index',
        'admin.school-facilities.index',
        'admin.extracurriculars.index',
        'admin.achievements.index',
        'admin.school-galleries.index',
        'admin.school-settings.principal-image.destroy',
        'admin.school-settings.hero-image.destroy',
    ];

    foreach ($removedRoutes as $routeName) {
        expect(Route::has($routeName))->toBeFalse();
    }

    expect(Route::has('admin.faqs.index'))->toBeTrue()
        ->and(Route::has('admin.school-settings.edit'))->toBeTrue();
});
