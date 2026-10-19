<?php

use App\Models\SchoolSetting;
use App\Services\ChatbotAiService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

beforeEach(function () {
    config(['services.groq.api_key' => 'test-groq-key']);
    Http::preventStrayRequests();
});

test('chatbot uses the supported default model and reads the final answer', function () {
    Http::fake([
        'api.groq.com/openai/v1/chat/completions' => Http::response([
            'choices' => [['message' => ['content' => ' Halo, selamat datang! ']]],
        ]),
    ]);

    expect(app(ChatbotAiService::class)->generate('Halo'))->toBe('Halo, selamat datang!');

    Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer test-groq-key')
        && $request['model'] === 'openai/gpt-oss-20b'
        && $request['max_completion_tokens'] === 1024
        && $request['reasoning_effort'] === 'low'
        && $request['include_reasoning'] === false
        && $request['messages'][1]['content'] === 'Halo');
    Http::assertSentCount(1);
});

test('chatbot allows a configured chat model without gpt oss specific parameters', function () {
    config(['services.groq.model' => 'custom-chat-model']);
    Http::fake(['*' => Http::response(['choices' => [['message' => ['content' => 'Jawaban.']]]])]);

    expect(app(ChatbotAiService::class)->generate('Halo'))->toBe('Jawaban.');

    Http::assertSent(fn ($request) => $request['model'] === 'custom-chat-model'
        && ! isset($request['reasoning_effort']) && ! isset($request['include_reasoning']));
});

test('chatbot does not send an unauthenticated request when the key is missing', function () {
    config(['services.groq.api_key' => '']);

    expect(app(ChatbotAiService::class)->generate('Halo'))->toContain('layanan AI sedang tidak tersedia');
    Http::assertNothingSent();
});

test('chatbot logs model failure without storing response bodies or conversation text', function () {
    Log::spy();
    Http::fake(['*' => Http::response([
        'error' => ['code' => 'model_not_found', 'message' => 'private error body'],
    ], 404)]);

    $answer = app(ChatbotAiService::class)->generate('private question');

    expect($answer)->toContain('layanan AI sedang tidak tersedia');
    Log::shouldHaveReceived('warning')->once()->with('Chatbot AI response error', [
        'attempt' => 1,
        'status' => 404,
        'model' => 'openai/gpt-oss-20b',
        'error_code' => 'model_not_found',
    ]);
    Http::assertSentCount(1);
});

test('chatbot provides a useful fallback for invalid answers and connection failures', function (string $failure) {
    $response = match ($failure) {
        'connection' => Http::failedConnection(),
        'blank' => Http::response(['choices' => [['message' => ['content' => '   ']]]]),
        'invalid type' => Http::response(['choices' => [['message' => ['content' => ['invalid']]]]]),
        default => Http::response([], 503),
    };
    Http::fake(['*' => $response]);

    expect(app(ChatbotAiService::class)->generate('Halo'))->toContain('layanan AI sedang tidak tersedia');
})->with(['connection', 'blank', 'invalid type', 'unavailable']);

test('chatbot uses the configured school contact in its fallback', function (?string $phone) {
    $school = SchoolSetting::current();
    $school->update(['phone' => $phone]);
    SchoolSetting::bust();
    Http::fake(['*' => Http::response([], 503)]);

    $answer = app(ChatbotAiService::class)->generate('Halo');

    expect($answer)->not->toContain('nomor panitia');
    if ($phone) {
        expect($answer)->toContain($phone);
    } else {
        expect($answer)->toContain('kontak sekolah yang tertera di halaman utama');
    }
})->with([null, '', '081234567890']);

test('chatbot retries a temporary rate limit and then returns the ai answer', function () {
    Http::fakeSequence()
        ->push(['error' => ['code' => 'rate_limit_exceeded']], 429)
        ->push(['choices' => [['message' => ['content' => 'Jawaban setelah retry.']]]]);

    expect(app(ChatbotAiService::class)->generate('Halo'))->toBe('Jawaban setelah retry.');
    Http::assertSentCount(2);
});
