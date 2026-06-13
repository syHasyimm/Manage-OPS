**Rencana Detail Implementasi Chatbot AI Pendekatan Hibrida** pada stack Laravel + React:

---

### 1. Arsitektur Alur Kerja (Workflow) Hibrida

Ketika pengunjung mengirim pesan, sistem akan memprosesnya dengan urutan sebagai berikut:

```
[Pengunjung: "Berapa biaya masuk sekolah?"]
                  │
                  ▼
         [React Frontend]
                  │ (Axios POST)
                  ▼
         [Laravel Backend]
                  │
                  ▼
    Step 1: Pembersihan Teks (Case Folding, Trim)
                  │
                  ▼
    Step 2: Pencarian ke DB Lokal (Tabel `faqs`)
                  │
                  ├──> [Ketemu] ──────> [Kembalikan Jawaban Lokal] ──┐
                  │ (Akurasi Tinggi)                                 │
                  │                                                  ▼
                  └──> [Tidak Ketemu] ─────────────────────────> [React UI]
                                │                                    ▲
                                ▼                                    │
                  Step 3: Teruskan ke AI API                          │
                          + Sisipkan "Context" Aturan Sekolah        │
                                │                                    │
                                ▼                                    │
                          [Respon AI] ───────────────────────────────┘

```

---

### 2. Tahap 1: Struktur Database & Manajemen FAQ Lokal (Laravel)

Database lokal berfungsi sebagai _filter_ pertama untuk menghemat kuota token AI API dan memastikan jawaban untuk hal-hal krusial (seperti nominal uang) 100% akurat sesuai kebijakan panitia.

**Skema Tabel `faqs`:**

```php
Schema::create('faqs', function (Blueprint $table) {
    $table->id();
    $table->string('question');
    $table->text('answer');
    $table->string('keywords'); // Contoh: "biaya, uang pangkal, spp, bayar"
    $table->timestamps();
});

```

**Logika Pencarian di Controller (Fitur Hibrida):**

```php
public function handleMessage(Request $request)
{
    $userMessage = strtolower(trim($request->input('message')));

    // 1. Cari di DB Lokal berdasarkan Keyword
    $localFaq = Faq::where(function($query) use ($userMessage) {
        $query->where('question', 'LIKE', "%{$userMessage}%")
              ->orWhere('keywords', 'LIKE', "%{$userMessage}%");
    })->first();

    if ($localFaq) {
        return response()->json([
            'sender' => 'bot',
            'message' => $localFaq->answer,
            'source' => 'local_db'
        ]);
    }

    // 2. Jika tidak ditemukan, lempar ke AI Service
    $aiResponse = $this->aiService->generateResponse($userMessage);

    return response()->json([
        'sender' => 'bot',
        'message' => $aiResponse,
        'source' => 'ai_api'
    ]);
}

```

---

### 3. Tahap 2: Integrasi AI API & Prompt Engineering

Agar AI (misalnya menggunakan Gemini API atau OpenAI) tidak memberikan jawaban di luar konteks sekolah atau berhalusinasi, Tuan perlu menyuntikkan _System Instruction / System Prompt_ pada setiap _request_.

**Strategi Prompting (Context Injection):**
Setiap kali mengirim pesan ke AI, gabungkan pesan user dengan instruksi tetap seperti ini:

```text
[System Instruction]:
Anda adalah "Asisten Pintar SPMB", chatbot resmi untuk Penerimaan Murid Baru di SD [Nama Sekolah].
Tugas Anda adalah membantu orang tua calon murid.
Jawablah dengan ramah, sopan, dan gunakan bahasa Indonesia yang baik.

Gunakan informasi berikut untuk menjawab:
- Pendaftaran gelombang 1 dibuka dari Januari - Maret 2026.
- Syarat utama: Akta kelahiran (usia minimal 6 tahun per Juli 2026), Kartu Keluarga, dan KTP Orang Tua.
- Alamat sekolah di Jl. Pahlawan No. 12.
- Jika ada pertanyaan mengenai detail biaya yang tidak Anda ketahui atau pertanyaan di luar topik sekolah, jawablah: "Mohon maaf, untuk informasi detail mengenai hal tersebut, Tuan/Puan dapat langsung menghubungi Panitia SPMB via WhatsApp di nomor 0812-xxxx-xxxx."

[Pertanyaan Pengunjung]: {Pesan dari User}

```

Tuan bisa membuat satu file _Service_ khusus di Laravel (`app/Services/ChatbotAiService.php`) untuk menyusun _payload_ ini sebelum menembak API AI.

---

### 4. Tahap 3: Pengembangan UI/UX di React (Tailwind CSS)

Pada sisi React, berikan pembeda visual yang halus (jika diperlukan) atau buat alurnya senatural mungkin dengan indikator tunggu.

**Poin Penting di Frontend:**

1. **State Percakapan:**

```javascript
const [messages, setMessages] = useState([
    {
        sender: "bot",
        message:
            "Halo! Ada yang bisa saya bantu terkait pendaftaran siswa baru?",
    },
]);
const [isLoading, setIsLoading] = useState(false);
```

```
2. **Handling Submit:**
   * Ubah `isLoading` menjadi `true` segera setelah user menekan kirim untuk menampilkan animasi *typing indicator* (titik tiga bergerak).
   * Lakukan *POST request* ke Laravel.
   * Setelah mendapat respons, masukkan pesan bot ke state dan kembalikan `isLoading` menjadi `false`.
3. **Pemberitahuan Sumber (Opsional untuk Admin):**
   Di dalam data JSON respons Laravel, terdapat properti `source` (`local_db` atau `ai_api`). Jika sedang dalam mode pengembangan/testing, Tuan bisa menampilkan *tag* kecil di bawah chat untuk memantau apakah sistem mengambil dari DB atau AI.

---

### 5. Tahap 4: Pengujian & Optimalisasi

* **Pengujian Kasus Batas (Edge Cases):** Uji chatbot dengan pertanyaan jebakan seperti *"Bagaimana cara membuat kue?"*. Pastikan *System Instruction* bekerja dan bot menolak menjawab dengan sopan menggunakan template yang sudah ditentukan.
* **Pengayaan Database Lokal berkelanjutan:** Sediakan halaman admin di Laravel untuk memantau riwayat chat pengunjung yang masuk ke kategori `ai_api`. Jika ada satu pertanyaan AI yang sering ditanyakan (misal: tentang seragam), Tuan bisa memasukkannya ke database `faqs` lokal agar ke depannya sistem tidak perlu menggunakan kuota AI API lagi untuk pertanyaan tersebut.

Rencana hibrida ini memberikan keseimbangan yang sangat baik antara kontrol penuh atas informasi penting sekolah dan fleksibilitas dalam melayani pertanyaan interaktif dari calon wali murid. Jika ada bagian kode spesifik atau konfigurasi API AI yang ingin Tuan bahas lebih lanjut, silakan sampaikan.

```
