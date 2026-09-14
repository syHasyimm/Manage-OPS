# SPMB Desktop

## Menjalankan mode pengembangan

```powershell
npm run desktop:dev
```

Perintah tersebut menyiapkan PHP portabel, menjalankan Laravel dan queue worker
secara lokal, lalu membuka jendela Tauri. Data pengembangan desktop disimpan di
`desktop/dev-data` dan tidak masuk Git.

## Membuat installer offline

Pastikan aplikasi web dapat terhubung ke database sumber yang ingin dibawa sebagai
data awal, lalu jalankan:

```powershell
npm run desktop:build
```

Build menghasilkan installer NSIS dan MSI di `src-tauri/target/release/bundle`.
Installer berisi PHP beserta Visual C++ runtime-nya, Laravel, dependensi produksi,
aset frontend, database SQLite awal, dan WebView2 offline. Komputer tujuan tidak
memerlukan PHP, Composer, Node.js, MySQL, maupun koneksi internet saat instalasi.

## Lokasi data pengguna

Data operasional tidak ditulis ke folder instalasi. Database SQLite, unggahan,
cache, log, dan cadangan disimpan di direktori data aplikasi Windows untuk
`id.schools.spmb.desktop`. Saat versi aplikasi berubah, launcher membuat cadangan
database sebelum menjalankan migrasi dan mempertahankan lima cadangan terakhir.

Integrasi eksternal seperti WhatsApp tetap membutuhkan internet. Atur
`WHATSAPP_DRIVER=log` untuk penggunaan yang sepenuhnya lokal tanpa pengiriman pesan.
