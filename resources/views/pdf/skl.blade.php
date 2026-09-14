<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Surat Keterangan Kelulusan - {{ $student->name }}</title>
<style>
    @page { margin: 8mm 15mm 8mm 15mm; }
    * { font-family: DejaVu Sans, sans-serif; }
    body { color: #000; font-size: 10pt; line-height: 1.2; margin: 0; padding: 0; }

    /* ===================== KOP RESMI ===================== */
    .kop { width: 100%; }
    .kop table { width: 100%; border-collapse: collapse; }
    .kop td { vertical-align: middle; }
    .kop-logo { width: 78px; text-align: center; padding-right: 4px; }
    .kop-logo img { width: 70px; height: 79px; object-fit: contain; }
    .kop-logo .logo-fallback {
        width: 65px;
        height: 65px;
        border: 2px dashed #bcccdc;
        border-radius: 50%;
        display: inline-block;
        line-height: 61px;
        color: #9fb3c8;
        font-size: 8pt;
    }
    .kop-logo-right { width: 78px; text-align: center; padding-left: 4px; }
    .kop-logo-right img { width: 70px; height: 70px; object-fit: contain; }
    .kop-text { text-align: center; padding: 0 6px; }
    .kop-gov {
        font-family: "Times New Roman", Times, serif;
        font-size: 14pt;
        font-weight: bold;
        color: #000;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: 0;
        margin-bottom: 2px;
    }
    .kop-school {
        font-size: 10pt;
        font-weight: bold;
        color: #000;
        text-transform: uppercase;
        letter-spacing: 0.5pt;
        line-height: 1;
        margin: 2px 0;
    }
    .kop-address { font-size: 9pt; color: #000; line-height: 1; margin: 0; }
    .kop-meta { font-size: 8.5pt; color: #000; line-height: 1; margin: 0; }
    .kop-divider {
        border-top: 2.5px solid #000;
        border-bottom: 1px solid #000;
        height: 3px;
        margin: 4px 0 10px;
    }
</style>
</head>
<body>

    {{-- ===== KOP SURAT ===== --}}
    <div class="kop">
        <table>
            <tr>
                <td class="kop-logo">
                    @if(! empty($school['logo_absolute']))
                        <img src="{{ $school['logo_absolute'] }}" alt="Logo Sekolah">
                    @else
                        <span class="logo-fallback">LOGO</span>
                    @endif
                </td>
                <td class="kop-text">
                    @if(! empty($school['government_regency']))
                        <div class="kop-gov">{{ $school['government_regency'] }}</div>
                    @endif
                    @if(! empty($school['education_office']))
                        <div class="kop-gov">{{ $school['education_office'] }}</div>
                    @endif
                    <div class="kop-school">{{ $school['name'] }}</div>
                    @if(! empty($school['npsn']) || ! empty($school['accreditation']) || ! empty($school['nss']))
                        <div class="kop-meta">
                            @if(! empty($school['npsn'])) NPSN: {{ $school['npsn'] }} @endif
                            @if(! empty($school['nss'])) {!! ! empty($school['npsn']) ? '&nbsp;|&nbsp;' : '' !!} NSS: {{ $school['nss'] }} @endif
                            @if(! empty($school['accreditation'])) {!! (! empty($school['npsn']) || ! empty($school['nss'])) ? '&nbsp;|&nbsp;' : '' !!} Akreditasi: {{ $school['accreditation'] }} @endif
                        </div>
                    @endif
                    @if(! empty($school['full_address']))
                        <div class="kop-address">{{ $school['full_address'] }}</div>
                    @endif
                    @if(! empty($school['phone']) || ! empty($school['email']) || ! empty($school['website']))
                        <div class="kop-meta">
                            @if(! empty($school['phone'])) Telp: {{ $school['phone'] }} @endif
                            @if(! empty($school['email'])) {!! ! empty($school['phone']) ? '&nbsp;|&nbsp;' : '' !!} Email: {{ $school['email'] }} @endif
                            @if(! empty($school['website'])) {!! (! empty($school['phone']) || ! empty($school['email'])) ? '&nbsp;|&nbsp;' : '' !!} Web: {{ $school['website'] }} @endif
                        </div>
                    @endif
                </td>
                <td class="kop-logo-right">
                    @if(! empty($school['regency_logo_absolute']))
                        <img src="{{ $school['regency_logo_absolute'] }}" alt="Logo Kabupaten">
                    @endif
                </td>
            </tr>
        </table>
    </div>
    <div class="kop-divider"></div>

    {{-- ===== JUDUL SURAT ===== --}}
    <div style="text-align:center; margin-bottom:10px;">
        <div style="font-size:12.5pt; font-weight:bold; text-decoration:underline; letter-spacing:0.5px;">SURAT KETERANGAN KELULUSAN</div>
        <div style="font-size:10pt; margin-top:2px;">Nomor : <b>{{ $skl->letter_number }}</b></div>
    </div>

    <p style="font-size:10pt; text-align:justify; line-height:1.3; margin:0 0 8px 0;">
        Yang bertanda tangan di bawah ini, Kepala {{ $school['name'] }} menerangkan bahwa :
    </p>

    {{-- ===== TABEL BIODATA SISWA ===== --}}
    <table style="font-size:10pt; line-height:1.2; margin-bottom:10px; border-collapse:collapse;">
        <tr>
            <td style="width:220px; padding:1px 0; vertical-align:top;">Nama</td>
            <td style="width:15px; padding:1px 0; vertical-align:top;">:</td>
            <td style="padding:1px 0; font-weight:bold; vertical-align:top;">{{ $student->name }}</td>
        </tr>
        <tr>
            <td style="padding:1px 0; vertical-align:top;">Jenis Kelamin</td>
            <td style="padding:1px 0; vertical-align:top;">:</td>
            <td style="padding:1px 0; vertical-align:top;">{{ $student->gender ?? '-' }}</td>
        </tr>
        <tr>
            <td style="padding:1px 0; vertical-align:top;">Tempat dan tanggal lahir</td>
            <td style="padding:1px 0; vertical-align:top;">:</td>
            <td style="padding:1px 0; vertical-align:top;">{{ $student->birth_place }}, {{ $birth_date_formatted }}</td>
        </tr>
        <tr>
            <td style="padding:1px 0; vertical-align:top;">Nama Orang tua</td>
            <td style="padding:1px 0; vertical-align:top;">:</td>
            <td style="padding:1px 0; vertical-align:top;">{{ $student->parent_name ?? '-' }}</td>
        </tr>
        <tr>
            <td style="padding:1px 0; vertical-align:top;">Sekolah Asal</td>
            <td style="padding:1px 0; vertical-align:top;">:</td>
            <td style="padding:1px 0; font-weight:bold; vertical-align:top;">{{ $student->previous_school ?? $school['name'] }}</td>
        </tr>
        <tr>
            <td style="padding:1px 0; vertical-align:top;">Nomor Induk Siswa</td>
            <td style="padding:1px 0; vertical-align:top;">:</td>
            <td style="padding:1px 0; vertical-align:top;">{{ $student->nis }}</td>
        </tr>
        <tr>
            <td style="padding:1px 0; vertical-align:top;">Nomor Induk Siswa Nasional</td>
            <td style="padding:1px 0; vertical-align:top;">:</td>
            <td style="padding:1px 0; vertical-align:top;">{{ $student->nisn }}</td>
        </tr>
    </table>

    <p style="font-size:10pt; text-align:justify; line-height:1.3; margin:0 0 8px 0;">
        Berdasarkan Peraturan Menteri Pendidikan, Kebudayaan, Riset dan Teknologi Nomor {{ $skl->regulation_number }} Tahun {{ $skl->regulation_year }} tentang Ijazah Pendidikan Dasar dan Pendidikan Menengah serta Surat Keputusan Kepala {{ $school['name'] }} nomor : <b>{{ $skl->decree_number }}</b> tanggal {{ $decree_date_formatted }} tentang Penetapan Kelulusan Siswa Tahun Pelajaran {{ $skl->academic_year }}, maka dengan ini siswa tersebut di atas dinyatakan :
    </p>

    <div style="text-align:center; font-weight:bold; font-size:12pt; margin:10px 0; letter-spacing:1px;">
        @if($skl->graduation_status === 'LULUS')
            <span style="text-decoration:underline;">LULUS</span> &nbsp;/&nbsp; <span style="text-decoration:line-through; color:#999;">TIDAK LULUS</span>
        @else
            <span style="text-decoration:line-through; color:#999;">LULUS</span> &nbsp;/&nbsp; <span style="text-decoration:underline;">TIDAK LULUS</span>
        @endif
    </div>

    <p style="text-align:center; font-size:10pt; margin:0 0 6px 0;">dari Sekolah Dasar dengan nilai Ujian (Nilai Ijazah) :</p>

    {{-- ===== TABEL NILAI ===== --}}
    <table style="width:100%; border-collapse:collapse; font-size:9.5pt; margin-bottom:12px;">
        <tr>
            <td style="border:1px solid #000; padding:4px 5px; text-align:center; font-weight:bold; width:35px;">No</td>
            <td style="border:1px solid #000; padding:4px 5px; text-align:center; font-weight:bold;">Mata Pelajaran</td>
            <td style="border:1px solid #000; padding:4px 5px; text-align:center; font-weight:bold; width:90px;">Nilai</td>
        </tr>
        @php
            $nomor = 0;
        @endphp
        @foreach($grades as $grade)
            @php $nomor++; @endphp
            <tr>
                <td style="border:1px solid #000; padding:3px 5px; text-align:center;">{{ $nomor }}.</td>
                <td style="border:1px solid #000; padding:3px 5px;">{{ $grade['mapel'] }}</td>
                <td style="border:1px solid #000; padding:3px 5px; text-align:center; font-weight:bold;">{{ $grade['nilai'] ?? '' }}</td>
            </tr>
        @endforeach
        <tr>
            <td style="border:1px solid #000; padding:4px 5px; text-align:center; font-weight:bold;" colspan="2">Rata-rata</td>
            <td style="border:1px solid #000; padding:4px 5px; text-align:center; font-weight:bold;">{{ $average_score }}</td>
        </tr>
    </table>

    <p style="font-size:10pt; text-align:justify; line-height:1.3; margin:0 0 10px 0;">
        Demikianlah surat keterangan kelulusan ini dibuat untuk dapat dipergunakan sebagaimana mestinya dan hanya berlaku sampai dengan diterbitnya Ijazah asli yang bersangkutan.
    </p>

    {{-- ===== TANDA TANGAN ===== --}}
    <table style="width:100%; border-collapse:collapse; font-size:10pt;">
        <tr>
            <td style="width:60%;"></td>
            <td style="width:40%; text-align:center; vertical-align:top;">
                <div>{{ $skl->issued_city }}, {{ $issued_date_formatted }}</div>
                <div style="margin-top:2px;">Kepala Sekolah</div>
                <div style="height:60px;"></div>
                <div style="font-weight:bold; text-decoration:underline;">{{ $skl->principal_name_snapshot }}</div>
                <div>NIP. {{ $skl->principal_nip_snapshot ?? '-' }}</div>
            </td>
        </tr>
    </table>

</body>
</html>
