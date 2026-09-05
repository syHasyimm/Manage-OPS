<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            // ── BIAYA ──────────────────────────────────────────────────────────
            [
                'question' => 'Apakah pendaftaran murid baru ini berbayar?',
                'answer' => 'Tidak. Pendaftaran murid baru di sekolah kami sepenuhnya GRATIS. Kami adalah sekolah negeri yang tidak memungut biaya pendaftaran dalam bentuk apapun. Silakan mendaftar tanpa khawatir.',
                'keywords' => 'biaya, gratis, bayar, uang pangkal, spp, iuran, pungutan, duit, tarif, ongkos, pendaftaran berbayar, uang masuk',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'question' => 'Apakah ada uang pangkal atau SPP yang harus dibayar?',
                'answer' => 'Tidak ada uang pangkal maupun SPP. Sebagai sekolah dasar negeri, seluruh biaya operasional ditanggung pemerintah. Orang tua tidak dikenakan pungutan apapun untuk mendaftarkan putra-putrinya.',
                'keywords' => 'uang pangkal, spp, iuran bulanan, biaya bulanan, biaya tahunan, pungutan, uang sekolah, uang gedung',
                'is_active' => true,
                'sort_order' => 2,
            ],

            // ── SYARAT & DOKUMEN ───────────────────────────────────────────────
            [
                'question' => 'Apa saja dokumen yang diperlukan untuk mendaftar?',
                'answer' => "Dokumen yang perlu disiapkan:\n1. Foto/scan Akta Kelahiran calon murid\n2. Foto/scan Kartu Keluarga (KK) yang masih aktif\n3. Foto/scan KTP Orang Tua/Wali\n4. Foto terbaru calon murid (opsional)\n5. Foto/scan Kartu Indonesia Pintar (KIP) jika ada\n\nSemua dokumen diunggah saat mengisi formulir online.",
                'keywords' => 'dokumen, syarat, persyaratan, berkas, akta, kk, kartu keluarga, ktp, foto, kip, kelengkapan, apa yang dibawa, apa yang disiapkan',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'question' => 'Apakah Kartu Indonesia Pintar (KIP) wajib?',
                'answer' => 'KIP tidak wajib. Dokumen ini hanya perlu diunggah jika calon murid memilikinya. KIP dapat membantu dalam proses seleksi prioritas, namun bukan syarat utama pendaftaran.',
                'keywords' => 'kip, kartu indonesia pintar, bsm, pip, kartu miskin, bantuan, beasiswa, wajib kip',
                'is_active' => true,
                'sort_order' => 4,
            ],

            // ── USIA ───────────────────────────────────────────────────────────
            [
                'question' => 'Berapa syarat usia minimal untuk mendaftar?',
                'answer' => 'Calon murid harus berusia minimal 6 tahun per tanggal 1 Juli pada tahun ajaran yang bersangkutan. Usia maksimal 12 tahun. Dibuktikan dengan Akta Kelahiran.',
                'keywords' => 'usia, umur, syarat usia, minimal umur, batas umur, lahir, kelahiran, berapa tahun, 6 tahun, 7 tahun',
                'is_active' => true,
                'sort_order' => 5,
            ],

            // ── ALUR PENDAFTARAN ───────────────────────────────────────────────
            [
                'question' => 'Bagaimana cara mendaftar secara online?',
                'answer' => "Cara mendaftar sangat mudah:\n1. Klik tombol \"Daftar\" di halaman utama\n2. Buat akun menggunakan nomor WhatsApp aktif\n3. Verifikasi dengan kode OTP yang dikirim ke WhatsApp\n4. Isi formulir 3 langkah: identitas murid, data periodik, dan data orang tua\n5. Unggah dokumen yang diperlukan\n6. Klik \"Submit\" — formulir PDF resmi akan dikirim ke WhatsApp Anda",
                'keywords' => 'cara daftar, langkah, alur, prosedur, bagaimana mendaftar, tutorial, daftar online, cara pendaftaran, mulai daftar',
                'is_active' => true,
                'sort_order' => 6,
            ],
            [
                'question' => 'Apakah pendaftaran harus dilakukan sekaligus atau bisa dicicil?',
                'answer' => 'Formulir bisa diisi bertahap. Setiap kali Anda klik "Simpan & Lanjut", data tersimpan otomatis. Anda bisa keluar dari aplikasi dan melanjutkan pengisian kapan saja hingga semua langkah selesai dan Anda menekan tombol Submit.',
                'keywords' => 'bertahap, cicil, simpan, lanjut, bisa disimpan, lanjutkan nanti, keluar dulu, tidak selesai, setengah jalan, interupsi',
                'is_active' => true,
                'sort_order' => 7,
            ],

            // ── OTP & AKUN ─────────────────────────────────────────────────────
            [
                'question' => 'Saya tidak menerima kode OTP WhatsApp, apa yang harus dilakukan?',
                'answer' => "Jika kode OTP tidak diterima:\n1. Pastikan nomor WhatsApp yang dimasukkan sudah benar\n2. Pastikan aplikasi WhatsApp aktif dan terhubung internet\n3. Tunggu hingga hitung mundur selesai, lalu klik \"Kirim Ulang OTP\"\n4. Jika masih belum menerima, hubungi panitia SPMB untuk bantuan lebih lanjut.",
                'keywords' => 'otp, kode otp, tidak terima otp, otp tidak masuk, whatsapp otp, kirim ulang, resend, verifikasi, kode verifikasi, wa otp',
                'is_active' => true,
                'sort_order' => 8,
            ],
            [
                'question' => 'Apakah satu nomor WhatsApp bisa digunakan untuk mendaftar lebih dari satu anak?',
                'answer' => 'Satu nomor WhatsApp hanya dapat digunakan untuk satu akun pendaftar. Jika Anda memiliki lebih dari satu anak yang akan mendaftar di tahun ajaran yang sama, silakan gunakan nomor WhatsApp yang berbeda untuk masing-masing pendaftaran.',
                'keywords' => 'satu nomor, dua anak, lebih dari satu, nomor sama, whatsapp sama, kakak adik, dua pendaftaran',
                'is_active' => true,
                'sort_order' => 9,
            ],

            // ── STATUS & PDF ───────────────────────────────────────────────────
            [
                'question' => 'Bagaimana cara mengecek status pendaftaran?',
                'answer' => 'Ada dua cara:\n1. Login ke akun Anda dan buka halaman Dashboard — status terbaru tampil di sana\n2. Gunakan menu "Cek Status" di halaman utama tanpa perlu login — cukup masukkan nomor pendaftaran Anda.',
                'keywords' => 'cek status, pantau, lihat status, nomor pendaftaran, sudah diterima, ditolak, diverifikasi, progress, hasil',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'question' => 'Kapan formulir PDF pendaftaran dikirim?',
                'answer' => 'Formulir PDF resmi dikirim otomatis ke WhatsApp Anda segera setelah Anda berhasil menekan tombol Submit. Jika PDF belum diterima dalam 5 menit, Anda bisa klik tombol "Kirim Ulang" di halaman sukses atau hubungi panitia.',
                'keywords' => 'pdf, formulir pdf, kapan dikirim, bukti pendaftaran, surat, download pdf, cetak, kirim ulang pdf',
                'is_active' => true,
                'sort_order' => 11,
            ],

            // ── WAKTU & JADWAL ─────────────────────────────────────────────────
            [
                'question' => 'Kapan pendaftaran murid baru dibuka?',
                'answer' => 'Informasi jadwal pendaftaran ditampilkan di halaman utama website ini. Silakan cek bagian atas halaman untuk melihat periode pendaftaran yang sedang aktif, termasuk tanggal buka dan tanggal tutup pendaftaran.',
                'keywords' => 'jadwal, kapan buka, kapan ditutup, tanggal, periode, gelombang, mulai, berakhir, deadline, batas waktu',
                'is_active' => true,
                'sort_order' => 12,
            ],

            // ── KUOTA ──────────────────────────────────────────────────────────
            [
                'question' => 'Berapa kuota atau daya tampung penerimaan murid baru?',
                'answer' => 'Informasi kuota penerimaan murid baru akan diumumkan oleh panitia. Silakan pantau halaman utama website atau hubungi sekolah langsung untuk informasi daya tampung terbaru.',
                'keywords' => 'kuota, daya tampung, jumlah siswa, kapasitas, berapa yang diterima, slot, tempat, kursi',
                'is_active' => true,
                'sort_order' => 13,
            ],

            // ── PENGUMUMAN HASIL ───────────────────────────────────────────────
            [
                'question' => 'Kapan pengumuman hasil seleksi penerimaan murid baru?',
                'answer' => 'Pengumuman hasil seleksi akan disampaikan melalui notifikasi WhatsApp dan dapat dicek melalui halaman "Cek Status" di website ini. Pantau terus status pendaftaran Anda di dashboard atau hubungi panitia untuk informasi jadwal pengumuman.',
                'keywords' => 'pengumuman, hasil seleksi, lulus, diterima, tidak diterima, kapan keluar, keputusan, lolos',
                'is_active' => true,
                'sort_order' => 14,
            ],

            // ── KONTAK ─────────────────────────────────────────────────────────
            [
                'question' => 'Bagaimana cara menghubungi panitia SPMB jika ada pertanyaan?',
                'answer' => 'Anda dapat menghubungi panitia SPMB melalui nomor telepon/WhatsApp sekolah yang tertera di bagian bawah halaman utama website ini. Panitia siap membantu pada hari dan jam kerja.',
                'keywords' => 'kontak, hubungi, panitia, telepon, wa, whatsapp, nomor, call, tanya langsung, bantuan, help',
                'is_active' => true,
                'sort_order' => 15,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::firstOrCreate(
                ['question' => $faq['question']],
                $faq,
            );
        }
    }
}
