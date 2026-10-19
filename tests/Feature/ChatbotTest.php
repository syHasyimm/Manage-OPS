<?php

use App\Models\Faq;
use App\Models\User;
use App\Services\ChatbotAiService;
use Database\Seeders\FaqSeeder;
use Illuminate\Support\Facades\Http;

test('chatbot rejects an empty message', function () {
    $this->postJson(route('chatbot.message'), ['message' => '   '])
        ->assertUnprocessable()
        ->assertJsonPath('source', 'error')
        ->assertJsonPath('message', 'Pesan tidak boleh kosong.');
});

test('chatbot answers matching spmb questions from the local faq', function () {
    Faq::create([
        'question' => 'Apakah pendaftaran dipungut biaya?',
        'answer' => 'Pendaftaran SPMB tidak dipungut biaya.',
        'keywords' => 'biaya, gratis, bayar',
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $this->postJson(route('chatbot.message'), ['message' => 'biaya'])
        ->assertOk()
        ->assertJsonPath('sender', 'bot')
        ->assertJsonPath('source', 'local_db')
        ->assertJsonPath('message', 'Pendaftaran SPMB tidak dipungut biaya.');
});

test('admin managed faq changes are reflected in the public chatbot', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->post(route('admin.faqs.store'), [
            'question' => 'Apa saja berkas pendaftaran?',
            'answer' => 'Siapkan kartu keluarga dan akta kelahiran.',
            'keywords' => 'berkaspendaftaran',
            'is_active' => true,
            'sort_order' => 0,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $faq = Faq::query()->where('keywords', 'berkaspendaftaran')->firstOrFail();

    $this->postJson(route('chatbot.message'), ['message' => 'berkaspendaftaran'])
        ->assertOk()
        ->assertJsonPath('source', 'local_db')
        ->assertJsonPath('message', 'Siapkan kartu keluarga dan akta kelahiran.');

    $this->patch(route('admin.faqs.update', $faq), [
        'question' => $faq->question,
        'answer' => 'Siapkan juga foto calon murid.',
        'keywords' => $faq->keywords,
        'is_active' => true,
        'sort_order' => 0,
    ])->assertRedirect()->assertSessionHasNoErrors();

    $this->postJson(route('chatbot.message'), ['message' => 'berkaspendaftaran'])
        ->assertOk()
        ->assertJsonPath('message', 'Siapkan juga foto calon murid.');

    $this->patch(route('admin.faqs.update', $faq), [
        'question' => $faq->question,
        'answer' => 'Siapkan juga foto calon murid.',
        'keywords' => $faq->keywords,
        'is_active' => false,
        'sort_order' => 0,
    ])->assertRedirect()->assertSessionHasNoErrors();

    $this->mock(ChatbotAiService::class)
        ->shouldReceive('generate')->once()->with('berkaspendaftaran')
        ->andReturn('Jawaban asisten SPMB.');

    $this->postJson(route('chatbot.message'), ['message' => 'berkaspendaftaran'])
        ->assertOk()
        ->assertJsonPath('source', 'ai_api');

    $this->delete(route('admin.faqs.destroy', $faq))->assertRedirect();
    $this->assertDatabaseMissing('faqs', ['id' => $faq->id]);
});

test('chatbot recognises conversational questions and selects the relevant faq', function (string $message, int $sortOrder) {
    $this->seed(FaqSeeder::class);
    Http::preventStrayRequests();

    $this->postJson(route('chatbot.message'), ['message' => $message])
        ->assertOk()
        ->assertJsonPath('source', 'local_db')
        ->assertJsonPath('message', Faq::where('sort_order', $sortOrder)->value('answer'));

    Http::assertNothingSent();
})->with([
    ['Berapa biaya pendaftaran?', 1],
    ['Apakah ada SPP bulanan?', 2],
    ['Apa saja berkas yang harus disiapkan?', 3],
    ['Apakah KIP wajib?', 4],
    ['Berapa syarat usia minimal untuk mendaftar?', 5],
    ['Bagaimana cara daftar online?', 6],
    ['Bolehkah saya lanjutkan nanti?', 7],
    ['Saya tidak menerima kode OTP WhatsApp, bagaimana?', 8],
    ['Bisa daftar dua anak dengan satu nomor?', 9],
    ['Bagaimana saya cek status pendaftaran?', 10],
    ['Bagaimana cara download PDF?', 11],
    ['Kapan pendaftaran dibuka? Ada jadwal?', 12],
    ['Berapa daya tampung sekolah?', 13],
    ['Kapan pengumuman hasil seleksi?', 14],
    ['Bagaimana menghubungi panitia?', 15],
    ['BIAYA PENDAFTARAN?!', 1],
]);

test('chatbot recognises question context without configured keywords', function () {
    Faq::create([
        'question' => 'Apa saja dokumen yang diperlukan untuk mendaftar?',
        'answer' => 'Siapkan dokumen pendaftaran.',
        'keywords' => null,
        'is_active' => true,
    ]);

    $this->postJson(route('chatbot.message'), ['message' => 'Dokumen apa yang diperlukan ya?'])
        ->assertOk()
        ->assertJsonPath('source', 'local_db');
});

test('chatbot does not match partial words wildcards or generic question words', function (string $message) {
    $this->seed(FaqSeeder::class);
    $this->mock(ChatbotAiService::class)
        ->shouldReceive('generate')->once()->with($message)
        ->andReturn('Jawaban asisten.');

    $this->postJson(route('chatbot.message'), ['message' => $message])
        ->assertOk()
        ->assertJsonPath('source', 'ai_api');
})->with(['%', '_', 'suratan', 'Bagaimana cara memasak nasi?', 'sekolah']);

test('chatbot validates the message before calling ai', function ($message) {
    Http::preventStrayRequests();

    $this->postJson(route('chatbot.message'), ['message' => $message])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('message');

    Http::assertNothingSent();
})->with([[['invalid']], [str_repeat('a', 2001)]]);
