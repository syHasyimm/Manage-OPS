<?php

namespace App\Services;

use App\Models\SchoolSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotAiService
{
    private string $apiKey;

    private string $apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    private string $model = 'llama-3.1-8b-instant';

    public function __construct()
    {
        $this->apiKey = config('services.groq.api_key', '');
    }

    public function generate(string $message): string
    {
        $school = SchoolSetting::current();
        $systemPrompt = $this->buildSystemPrompt($school);

        $payload = [
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user',   'content' => $message],
            ],
            'temperature' => 0.7,
            'max_tokens' => 512,
        ];

        $maxRetries = 3;
        $delay = 1;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->timeout(15)
                    ->post($this->apiUrl, $payload);

                if ($response->successful()) {
                    $text = $response->json('choices.0.message.content');
                    if ($text) {
                        return trim($text);
                    }
                }

                if ($response->status() === 429 && $attempt < $maxRetries) {
                    Log::info("Chatbot AI rate limited (attempt {$attempt}/{$maxRetries}), retrying in {$delay}s...");
                    sleep($delay);
                    $delay *= 2;

                    continue;
                }

                Log::warning('Chatbot AI response error', [
                    'attempt' => $attempt,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                break;

            } catch (\Throwable $e) {
                Log::error('Chatbot AI exception', ['attempt' => $attempt, 'error' => $e->getMessage()]);
                break;
            }
        }

        $phone = $school->phone ?? 'panitia';

        return "Mohon maaf, asisten sedang sibuk. Silakan coba lagi dalam beberapa detik, atau hubungi panitia SPMB langsung via WhatsApp di nomor {$phone}.";
    }

    private function buildSystemPrompt(SchoolSetting $school): string
    {
        $address = $school->fullAddress() ?: $school->address ?? '-';
        $phone = $school->phone ?? '-';
        $name = $school->name ?? 'sekolah kami';

        return <<<PROMPT
Anda adalah "Asisten SPMB {$name}", chatbot resmi untuk Penerimaan Murid Baru.
Tugas Anda adalah membantu orang tua calon murid dengan ramah, sopan, dan menggunakan Bahasa Indonesia yang baik.

Informasi resmi sekolah:
- Nama sekolah: {$name}
- Alamat: {$address}
- Telepon/WhatsApp: {$phone}
- Pendaftaran sepenuhnya GRATIS, tidak ada biaya apapun karena ini sekolah negeri.
- Syarat pendaftaran: Akta Kelahiran (usia minimal 6 tahun per Juli tahun ajaran berjalan), Kartu Keluarga, KTP Orang Tua, dan foto terbaru calon murid.
- Pendaftaran dilakukan secara online melalui website ini.

Aturan penting:
1. Hanya jawab pertanyaan yang berkaitan dengan sekolah dan proses pendaftaran murid baru.
2. Selalu tegaskan bahwa pendaftaran GRATIS jika ada pertanyaan tentang biaya.
3. Jika pertanyaan di luar topik sekolah (misalnya resep masakan, berita politik, dll), tolak dengan sopan: "Maaf, saya hanya dapat membantu pertanyaan seputar pendaftaran murid baru di {$name}."
4. Selalu akhiri jawaban dengan tawaran bantuan lebih lanjut jika diperlukan.
5. Jawab dalam Bahasa Indonesia yang ramah dan mudah dipahami orang tua.
PROMPT;
    }
}
