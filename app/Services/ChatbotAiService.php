<?php

namespace App\Services;

use App\Models\SchoolSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotAiService
{
    private string $apiKey;

    private string $apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    private string $model;

    public function __construct()
    {
        $this->apiKey = trim((string) config('services.groq.api_key', ''));
        $this->model = trim((string) config('services.groq.model', '')) ?: 'openai/gpt-oss-20b';
    }

    public function generate(string $message): string
    {
        $school = SchoolSetting::current();
        if ($this->apiKey === '') {
            Log::warning('Chatbot AI API key is not configured');

            return $this->unavailableMessage($school);
        }

        $systemPrompt = $this->buildSystemPrompt($school);

        $payload = [
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user',   'content' => $message],
            ],
            'temperature' => 0.3,
            'max_completion_tokens' => 1024,
        ];

        if (str_starts_with($this->model, 'openai/gpt-oss-')) {
            $payload['reasoning_effort'] = 'low';
            $payload['include_reasoning'] = false;
        }

        $maxRetries = 3;
        $delay = 1;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->connectTimeout(5)
                    ->timeout(15)
                    ->post($this->apiUrl, $payload);

                if ($response->successful()) {
                    $text = $response->json('choices.0.message.content');
                    if (is_string($text) && trim($text) !== '') {
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
                    'model' => $this->model,
                    'error_code' => $response->json('error.code'),
                ]);
                break;

            } catch (\Throwable $e) {
                Log::error('Chatbot AI exception', ['attempt' => $attempt, 'exception' => get_class($e)]);
                break;
            }
        }

        return $this->unavailableMessage($school);
    }

    private function unavailableMessage(SchoolSetting $school): string
    {
        $phone = trim($school->phone ?? '');
        $contact = $phone !== ''
            ? "hubungi panitia SPMB melalui WhatsApp di nomor {$phone}."
            : 'hubungi panitia SPMB melalui kontak sekolah yang tertera di halaman utama.';

        return "Maaf, layanan AI sedang tidak tersedia.\n\nAnda tetap dapat bertanya tentang biaya, syarat, dokumen, atau cara pendaftaran.\n\nUntuk bantuan lebih lanjut, ".$contact;
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
2. Jika ditanya tentang biaya, sampaikan bahwa pendaftaran gratis.
3. Jika pertanyaan di luar topik sekolah (misalnya resep masakan, berita politik, dll), tolak dengan sopan: "Maaf, saya hanya dapat membantu pertanyaan seputar pendaftaran murid baru di {$name}."
4. Jawab langsung inti pertanyaan dalam Bahasa Indonesia yang ramah dan mudah dipahami orang tua. Untuk pertanyaan sederhana, cukup 2–4 kalimat. Jangan mengulang pertanyaan, salam, atau tawaran bantuan pada setiap jawaban.
5. Pisahkan paragraf dengan satu baris kosong. Gunakan daftar bernomor untuk langkah pendaftaran dan daftar poin untuk persyaratan atau dokumen. Tiap butir daftar harus berada pada baris tersendiri. Gunakan satu pengantar singkat dan satu daftar bila diperlukan; jangan mengulang isi daftar sebagai langkah atau paragraf tambahan. Sampaikan semua butir yang diperlukan tanpa memotong informasi penting.
6. Gunakan Markdown sederhana. Tebalkan hanya informasi penting dengan **teks tebal**. Hindari tabel, HTML, blok kode, judul berlebihan, emoji, dan kata-kata dengan huruf kapital semua.
7. Gunakan hanya informasi resmi yang tercantum di atas. Jangan menambahkan jadwal, kuota, nomor kontak, ukuran/latar foto, aturan dokumen, atau persyaratan lain yang tidak tersedia. Jika detail belum diketahui, arahkan ke informasi resmi di website atau panitia.
PROMPT;
    }
}
