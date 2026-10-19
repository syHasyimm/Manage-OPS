<?php

use App\Jobs\SendCalendarReminder;
use App\Services\WhatsApp\Contracts\WhatsAppService;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

test('old queued calendar reminders never send whatsapp or modify historical deliveries', function () {
    $whatsApp = Mockery::mock(WhatsAppService::class);
    $whatsApp->shouldNotReceive('sendText');
    $whatsApp->shouldNotReceive('sendTextWithReceipt');
    app()->instance(WhatsAppService::class, $whatsApp);

    DB::enableQueryLog();
    DB::flushQueryLog();

    app()->call([unserialize(serialize(new SendCalendarReminder(1))), 'handle']);

    expect(DB::getQueryLog())->toBeEmpty();
    DB::disableQueryLog();
});

test('calendar reminder command and schedule have been removed', function () {
    expect(Artisan::all())->not->toHaveKey('calendar:send-reminders');
    expect(app(Schedule::class)->events())->toBeEmpty();
});
