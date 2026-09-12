<?php

use App\Models\Faq;

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
