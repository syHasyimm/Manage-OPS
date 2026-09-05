# Rencana Sistem Surat Keterangan Kelulusan (SKL)

## 1. Ringkasan

Sistem ini digunakan untuk mengelola data siswa, nilai, dan data SK Kelulusan, lalu secara otomatis menghasilkan dokumen **Surat Keterangan Kelulusan** menggunakan template HTML yang sudah dibuat. Tujuannya: operator sekolah cukup input data sekali, sistem yang menyusun dan mencetak suratnya.

---

## 2. Skema Basis Data

### 2.1 `sekolah`
Data profil sekolah — tetap dibutuhkan di backend walau KOP tidak dicetak di surat, karena dipakai untuk mengisi kalimat "Kepala [Nama Sekolah] menerangkan...".

| Field | Tipe | Keterangan |
|---|---|---|
| id | INT (PK) | |
| npsn | VARCHAR(20) | *ditambahkan* — identitas resmi sekolah |
| nama_sekolah | VARCHAR(150) | |
| alamat | TEXT | |
| nama_kepala_sekolah | VARCHAR(100) | |
| nip_kepala_sekolah | VARCHAR(30) | |

### 2.2 `tahun_ajaran`

| Field | Tipe | Keterangan |
|---|---|---|
| id | INT (PK) | |
| tahun_pelajaran | VARCHAR(9) | contoh: `"2025/2026"` |
| status_aktif | BOOLEAN | *ditambahkan* — menandai tahun ajaran yang sedang berjalan |

### 2.3 `mata_pelajaran`
Referensi mapel, supaya daftar mapel & muatan lokal tidak *hardcode*.

| Field | Tipe | Keterangan |
|---|---|---|
| id | INT (PK) | |
| nama_mapel | VARCHAR(100) | |
| kelompok | ENUM('A','B') | |
| jenis | ENUM('wajib','mulok') | *ditambahkan* — mulok bisa 1–3 baris (a/b/c), jumlahnya variatif |
| urutan | INT | untuk urutan cetak di tabel nilai |

### 2.4 `siswa`

| Field | Tipe | Keterangan |
|---|---|---|
| id | INT (PK) | |
| nis | VARCHAR(20) | |
| nisn | VARCHAR(20) UNIQUE | NISN bersifat unik nasional |
| nama | VARCHAR(100) | |
| jenis_kelamin | ENUM('Laki-Laki','Perempuan') | |
| tempat_lahir | VARCHAR(100) | |
| tanggal_lahir | DATE | |
| nama_orang_tua | VARCHAR(100) | |
| sekolah_asal | VARCHAR(150) | |
| kelas | VARCHAR(10) | *ditambahkan* — memudahkan filter/rekap per rombel |
| tahun_ajaran_id | FK → tahun_ajaran.id | |

### 2.5 `nilai_siswa`
Satu baris per mapel per siswa (bukan kolom lebar), supaya jumlah mapel fleksibel dari tahun ke tahun.

| Field | Tipe | Keterangan |
|---|---|---|
| id | INT (PK) | |
| siswa_id | FK → siswa.id | |
| mapel_id | FK → mata_pelajaran.id | |
| nilai | DECIMAL(5,2) | validasi rentang 0–100 |
| *(unique)* | siswa_id + mapel_id | cegah nilai ganda untuk mapel yang sama |

### 2.6 `surat_keterangan_kelulusan`
Record utama surat/SKL.

| Field | Tipe | Keterangan |
|---|---|---|
| id | INT (PK) | |
| siswa_id | FK → siswa.id | |
| nomor_surat | VARCHAR(50) | *ditambahkan* — nomor surat SKL, terpisah dari nomor SK |
| nomor_sk | VARCHAR(50) | input manual sesuai permintaan |
| tanggal_sk | DATE | |
| nomor_permen | VARCHAR(10) | |
| tahun_permen | YEAR | |
| tahun_pelajaran_id | FK → tahun_ajaran.id | |
| status_kelulusan | ENUM('LULUS','TIDAK LULUS') | |
| rata_rata | DECIMAL(5,2) | *dihitung otomatis* dari `nilai_siswa` |
| tempat_terbit | VARCHAR(100) | *ditambahkan* — kota penerbitan surat |
| tanggal_terbit | DATE | *ditambahkan* — bisa berbeda dari tanggal_sk |
| nama_kepsek_snapshot | VARCHAR(100) | *ditambahkan* — jaga histori tanda tangan |
| nip_kepsek_snapshot | VARCHAR(30) | *ditambahkan* |
| status_dokumen | ENUM('draft','final') | *ditambahkan* — cegah surat tercetak sebelum lengkap |
| dibuat_oleh | FK → users.id | *ditambahkan* — jejak audit siapa yang input |
| created_at / updated_at | TIMESTAMP | |

### 2.7 `users` *(opsional, jika operator lebih dari satu orang)*

| Field | Tipe | Keterangan |
|---|---|---|
| id | INT (PK) | |
| nama | VARCHAR(100) | |
| username | VARCHAR(50) UNIQUE | |
| password_hash | VARCHAR(255) | |
| role | ENUM('admin','operator') | |

---

## 3. Relasi Antar Tabel

- `siswa` → `tahun_ajaran` (many-to-one)
- `nilai_siswa` → `siswa` & `mata_pelajaran` (many-to-one masing-masing)
- `surat_keterangan_kelulusan` → `siswa` (one-to-one per penerbitan surat)
- `surat_keterangan_kelulusan` → `tahun_ajaran` (many-to-one)
- `surat_keterangan_kelulusan` → `users` (many-to-one, sebagai pencatat)

---

## 4. Alur Kerja Sistem (Workflow)

1. **Setup data master** — sekali di awal tahun ajaran: isi profil sekolah (nama, NPSN, kepala sekolah), buat entri `tahun_ajaran` baru, pastikan daftar `mata_pelajaran` (termasuk mulok a/b/c) sesuai kurikulum yang berlaku.
2. **Input atau impor data siswa** — input manual satu per satu, atau impor massal dari Excel/CSV (NIS, NISN, nama, tempat/tanggal lahir, nama orang tua, sekolah asal, kelas). Sistem validasi NISN harus unik sebelum disimpan.
3. **Input nilai per mata pelajaran** — form per siswa atau tabel input massal per kelas. Sistem otomatis menghitung rata-rata.
4. **Input data SK Kelulusan** — nomor SK (manual), tanggal SK, nomor & tahun Permendikbud, tahun pelajaran, status LULUS/TIDAK LULUS. Bisa per siswa atau *bulk* untuk satu angkatan.
5. **Generate nomor surat & preview** — sistem membuat `nomor_surat` otomatis (format berurut per sekolah), mengisi template HTML dengan data siswa + nilai, lalu menampilkan pratinjau sebelum status "final".
6. **Cetak, ekspor PDF, dan arsipkan** — setelah dikonfirmasi, ubah `status_dokumen` jadi "final", ekspor ke PDF, simpan sebagai arsip permanen. Surat final idealnya tidak bisa diedit tanpa jejak revisi.
7. **Pencarian & cetak ulang** — fitur cari surat berdasarkan nama/NIS/nomor surat untuk cetak ulang atau verifikasi tanpa input ulang.

---

## 5. Catatan Desain Penting

- **Nilai disimpan per baris**, bukan per kolom, di `nilai_siswa` — supaya jumlah mapel/mulok bisa berubah tanpa mengubah struktur tabel.
- **Nomor surat dan nomor SK dipisah** — pada dokumen aslinya ada dua nomor berbeda (nomor surat, mis. `400.3.11.1/SDN001-KEP/037`, dan nomor SK, mis. `Kpts.400.3.11.1/SDN001-KEP/036`), jadi keduanya butuh field sendiri.
- **`status_dokumen`** mencegah surat "bocor" ke siswa sebelum semua nilai lengkap dan tervalidasi.
- **Snapshot nama/NIP kepala sekolah** di setiap record surat menjaga keakuratan histori jika kepala sekolah berganti di kemudian hari.

---

## 6. Langkah Selanjutnya

- [ ] Buat skema SQL siap pakai (`CREATE TABLE`) dari rancangan di atas.
- [ ] Buat prototipe form input (HTML/JS) yang langsung mengisi template surat secara otomatis.
- [ ] Tentukan format penomoran surat otomatis (mis. `{no_urut}/{kode_sekolah}-{tahun}`).
