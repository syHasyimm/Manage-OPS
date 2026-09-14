# Rencana Aplikasi Desktop Offline

Dokumen ini menjadi sumber kerja implementasi Tauri 2 yang menjalankan Laravel dan SQLite secara lokal.

## Status implementasi

- [x] Bootstrap Laravel desktop, SQLite, storage AppData, dan endpoint startup.
- [x] Launcher Tauri, loopback dinamis, queue worker, single-instance, dan penghentian proses anak.
- [x] PHP portabel, extension aplikasi, Composer production, aset Vite, serta data awal SQLite.
- [x] Backup otomatis sebelum migrasi versi dan retensi lima cadangan terakhir.
- [x] Pengujian migrasi SQLite, ekspor MySQL ke SQLite, health check runtime, cleanup proses, dan test Laravel.
- [x] Installer offline NSIS dan MSI untuk Windows x86_64.
- [ ] Penandatanganan kode dan updater produksi; membutuhkan sertifikat serta endpoint rilis milik sekolah.
- [ ] Uji matriks pada mesin Windows 10/11 bersih sebelum distribusi luas.

## Arsitektur target

- Tauri 2 menyediakan jendela desktop, siklus hidup proses, single-instance, dan installer Windows.
- PHP 8.2+ dibundel sebagai sidecar dan hanya mendengarkan pada `127.0.0.1`.
- Laravel, dependensi Composer produksi, serta aset Vite dibundel sebagai resource aplikasi.
- Database utama menggunakan SQLite dan disimpan pada direktori data aplikasi pengguna, bukan direktori instalasi.
- Folder `storage`, log, cache, ekspor, unggahan, dan cadangan juga berada pada direktori data aplikasi pengguna.
- Queue dijalankan oleh proses worker lokal yang dikelola Tauri. Integrasi internet seperti WhatsApp tetap tersedia saat koneksi ada, tetapi kegagalannya tidak menghalangi fitur lokal.

## Tahapan

1. Audit kompatibilitas seluruh migrasi dan query terhadap SQLite.
2. Tambahkan bootstrap desktop Laravel yang mengalihkan database dan storage ke AppData.
3. Tambahkan launcher backend yang memilih port loopback, menjalankan migrasi, dan menyalakan Laravel serta queue worker.
4. Scaffold Tauri 2, capability minimum, halaman startup, pemeriksaan kesehatan, dan penghentian child process.
5. Paketkan PHP beserta extension yang dibutuhkan aplikasi.
6. Tambahkan alur backup, migrasi data MySQL lama, dan pemulihan manual dari berkas cadangan.
7. Verifikasi penyimpanan PDF, impor Excel, unggahan, dan pencetakan melalui WebView.
8. Uji instalasi bersih, upgrade, offline, pemulihan crash, dan seluruh fitur admin.
9. Hasilkan installer NSIS/MSI; penandatanganan dan updater dilakukan setelah sertifikat tersedia.

## Kriteria penerimaan

- Aplikasi dapat dipasang dan dijalankan pada Windows 10/11 tanpa PHP, Composer, Node.js, atau MySQL terpisah.
- Aplikasi hanya membuka server pada loopback dan tidak dapat diakses dari jaringan lokal.
- Data tetap tersedia setelah aplikasi ditutup, diperbarui, atau dipasang ulang tanpa memilih penghapusan data.
- Migrasi otomatis selalu membuat backup sebelum mengubah skema.
- PDF, unggahan, impor Excel, dan antrean lokal berjalan tanpa internet.
- Fitur eksternal menampilkan status offline dan dapat dicoba ulang ketika internet kembali.
- Hanya satu instance aplikasi dan satu writer database yang berjalan pada satu profil pengguna.

## Keputusan teknis

- Platform awal: Windows x86_64.
- Database: SQLite dengan foreign key, WAL, busy timeout, constraint unik, dan retry transaksi.
- Runtime web: Laravel pada port loopback dinamis dengan token bootstrap per sesi.
- Data pengguna: `%LOCALAPPDATA%/SPMB Desktop`.
- Installer utama: NSIS per-user; MSI disediakan bila dibutuhkan institusi.
