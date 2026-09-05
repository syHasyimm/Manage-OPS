<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Formulir Pendaftaran - {{ $registration->registration_number }}</title>
    <style>
        @page { margin: 22mm 18mm 22mm 18mm; }
        * { font-family: DejaVu Sans, sans-serif; }
        body { color: #102a43; font-size: 10.5pt; line-height: 1.45; }
        .watermark {
            position: fixed;
            top: 38%;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 76pt;
            color: rgba(30, 58, 95, 0.06);
            transform: rotate(-30deg);
            -webkit-transform: rotate(-30deg);
            font-weight: bold;
            letter-spacing: 4pt;
            z-index: -1;
        }

        /* ===================== KOP RESMI ===================== */
        .kop { width: 100%; }
        .kop table { width: 100%; border-collapse: collapse; }
        .kop td { vertical-align: middle; }
        .kop-logo { width: 78px; text-align: center; padding-right: 4px; }
        .kop-logo img { width: 70px; height: 70px; object-fit: contain; }
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
        .kop-logo-right img { width: 70px; height: 78px; object-fit: contain; }
        .kop-text { text-align: center; padding: 0 6px; }
        .kop-gov {
            font-family: "Times New Roman", Times, serif;
            font-size: 14pt;
            font-weight: bold;
            color: #1E3A5F;
            line-height: 1;
            text-transform: uppercase;
            letter-spacing: 0;
            margin-bottom: 2px;
        }
        .kop-school {
            font-size: 10pt;
            font-weight: bold;
            color: #1E3A5F;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            line-height: 1;
            margin: 2;
        }
        .kop-address { font-size: 9pt; color: #243b53; line-height: 1; margin: 0; }
        .kop-meta { font-size: 8.5pt; color: #486581; line-height: 1; margin: 0; }
        .kop-divider {
            border-top: 2.5px solid #1E3A5F;
            border-bottom: 1px solid #1E3A5F;
            height: 3px;
            margin: 6px 0 14px;
        }

        /* ===================== DOCUMENT TITLE ===================== */
        .doc-title {
            text-align: center;
            margin: 4px 0 4px;
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1pt;
            color: #1E3A5F;
        }
        .doc-title-underline {
            border-bottom: 1.5px solid #1E3A5F;
            width: 320px;
            margin: 0 auto 6px;
        }
        .doc-sub { text-align: center; font-size: 10pt; margin-bottom: 14px; color: #486581; }

        /* ===================== META ===================== */
        .meta {
            display: table;
            width: 100%;
            margin-bottom: 12px;
            font-size: 9.5pt;
        }
        .meta .cell { display: table-cell; padding: 6px 8px; border: 1px solid #bcccdc; background: #f0f4f8; }
        .meta .cell strong { display: block; color: #486581; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.5pt; }

        /* ===================== SECTIONS ===================== */
        .section-title {
            background: #1E3A5F;
            color: white;
            padding: 5px 10px;
            font-size: 10pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            margin-top: 12px;
            margin-bottom: 0;
        }
        table.data { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
        table.data td { border: 1px solid #bcccdc; padding: 5px 8px; vertical-align: top; }
        table.data td.label { width: 30%; background: #f0f4f8; font-weight: 600; color: #243b53; }
        table.data td.value { background: #fff; }
        .grid2 { display: table; width: 100%; }
        .grid2 .col { display: table-cell; width: 50%; }
        .grid2 .col:first-child { padding-right: 4px; }
        .grid2 .col:last-child { padding-left: 4px; }

        /* ===================== FOOTER ===================== */
        .footer {
            margin-top: 18px;
            display: table;
            width: 100%;
        }
        .footer .left { display: table-cell; vertical-align: top; width: 65%; font-size: 9.5pt; }
        .footer .right { display: table-cell; vertical-align: top; text-align: right; width: 35%; font-size: 9.5pt; }
        .qr { margin-top: 4px; }
        .signoff { margin-top: 50px; }
        .stamp-line { display: inline-block; width: 220px; border-top: 1px solid #102a43; padding-top: 4px; font-weight: bold; }
        .nip-line { font-size: 8.5pt; color: #243b53; margin-top: 2px; }
        .small { font-size: 9pt; color: #486581; }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            background: #C9A84C;
            color: #1E3A5F;
            font-weight: bold;
            border-radius: 3px;
            letter-spacing: 0.5pt;
        }
    </style>
</head>
<body>
    <div class="watermark">SPMB {{ $registration->period->yearKey() }}</div>

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

    <div class="doc-title">Formulir Pendaftaran Murid Baru</div>
    <div class="doc-title-underline"></div>
    <div class="doc-sub">Tahun Ajaran {{ $registration->period->academic_year }}</div>

    <div class="meta">
        <div class="cell" style="width:25%">
            <strong>No. Pendaftaran</strong>
            <span class="badge">{{ $registration->registration_number }}</span>
        </div>
        <div class="cell" style="width:30%">
            <strong>Nama Murid</strong>
            {{ $identity->full_name }}
        </div>
        <div class="cell" style="width:25%">
            <strong>Tanggal Submit</strong>
            {{ optional($registration->submitted_at)->translatedFormat('d F Y H:i') ?? '-' }}
        </div>
        <div class="cell" style="width:20%">
            <strong>Status</strong>
            {{ strtoupper($registration->status) }}
        </div>
    </div>

    <h3 class="section-title">A. Identitas Murid</h3>
    <table class="data">
        <tr><td class="label">Satuan Pendidikan</td><td class="value">{{ $identity->school_name }}</td>
            <td class="label">Kecamatan</td><td class="value">{{ $identity->district }}</td></tr>
        <tr><td class="label">Nama Lengkap</td><td class="value" colspan="3">{{ $identity->full_name }}</td></tr>
        <tr><td class="label">Jenis Kelamin</td><td class="value">{{ $identity->gender === 'L' ? 'Laki-Laki' : 'Perempuan' }}</td>
            <td class="label">Anak ke-</td><td class="value">{{ $identity->child_order }}</td></tr>
        <tr><td class="label">NIK</td><td class="value">{{ $identity->nik }}</td>
            <td class="label">No KK</td><td class="value">{{ $identity->kk_number }}</td></tr>
        <tr><td class="label">Tempat/Tgl Lahir</td><td class="value" colspan="3">{{ $identity->birth_place }}, {{ \Illuminate\Support\Carbon::parse($identity->birth_date)->translatedFormat('d F Y') }}</td></tr>
        <tr><td class="label">Sekolah TK Asal</td><td class="value" colspan="3">{{ $identity->previous_kindergarten ?: '-' }}</td></tr>
        <tr><td class="label">Agama</td><td class="value">{{ ucfirst($identity->religion) }}</td>
            <td class="label">Berkebutuhan Khusus</td><td class="value">{{ $identity->has_special_needs ? implode(', ', $identity->special_needs_types ?? []) : 'Tidak' }}</td></tr>
        <tr><td class="label">Alamat</td><td class="value" colspan="3">{{ $identity->address }}</td></tr>
        <tr><td class="label">Dusun / Kelurahan</td><td class="value">{{ $identity->dusun_name }} / {{ $identity->kelurahan_name }}</td>
            <td class="label">RT / RW / Kode Pos</td><td class="value">{{ $identity->rt }} / {{ $identity->rw }} / {{ $identity->postal_code }}</td></tr>
        <tr><td class="label">Tempat Tinggal</td><td class="value">{{ str_replace('_', ' ', ucfirst($identity->residence_type)) }}</td>
            <td class="label">Transportasi</td><td class="value">{{ str_replace('_', ' ', ucfirst($identity->transportation)) }}</td></tr>
        <tr><td class="label">Nomor HP / WA</td><td class="value">{{ $identity->phone_wa }}</td>
            <td class="label">KPS / KPH / KIP</td><td class="value">
                KPS: {{ $identity->is_kps_kph_recipient ? 'Ya' : 'Tidak' }} | KIP: {{ $identity->has_kip ? 'Ya' : 'Tidak' }}
            </td></tr>
    </table>

    <h3 class="section-title">B. Data Periodik</h3>
    <table class="data">
        <tr><td class="label">Tinggi / Berat</td><td class="value">{{ $periodic->height_cm }} cm / {{ $periodic->weight_kg }} kg</td>
            <td class="label">Saudara Kandung</td><td class="value">{{ $periodic->siblings_count }}</td></tr>
        <tr><td class="label">Hobi</td><td class="value">{{ $periodic->hobby ?: '-' }}</td>
            <td class="label">Cita-Cita</td><td class="value">{{ $periodic->aspiration ?: '-' }}</td></tr>
        <tr><td class="label">No Akta Lahir</td><td class="value" colspan="3">{{ $periodic->birth_certificate_number ?: '-' }}</td></tr>
        <tr><td class="label">Jarak ke Sekolah</td><td class="value">
                {{ $periodic->distance_category === '>1km' ? 'Lebih dari 1 km ('.$periodic->distance_km.' km)' : 'Kurang dari 1 km' }}
            </td>
            <td class="label">Waktu Tempuh</td><td class="value">{{ $periodic->travel_time_minutes ? $periodic->travel_time_minutes.' menit' : '-' }}</td></tr>
    </table>

    <h3 class="section-title">C. Data Orang Tua / Wali</h3>
    <div class="grid2">
        <div class="col">
            <table class="data">
                <tr><td class="label" colspan="2"><strong>Ayah Kandung</strong></td></tr>
                <tr><td class="label">Nama</td><td>{{ $father?->name ?: '-' }}</td></tr>
                <tr><td class="label">NIK</td><td>{{ $father?->nik ?: '-' }}</td></tr>
                <tr><td class="label">Pekerjaan</td><td>{{ str_replace('_', ' ', ucfirst($father?->occupation ?? '-')) }}</td></tr>
                <tr><td class="label">Pendidikan</td><td>{{ strtoupper($father?->education ?? '-') }}</td></tr>
                <tr><td class="label">Penghasilan</td><td>{{ $father?->monthly_income ?: '-' }}</td></tr>
                <tr><td class="label">Status</td><td>{{ ($father?->is_alive ?? true) ? 'Masih Hidup' : 'Almarhum' }}</td></tr>
            </table>
        </div>
        <div class="col">
            <table class="data">
                <tr><td class="label" colspan="2"><strong>Ibu Kandung</strong></td></tr>
                <tr><td class="label">Nama</td><td>{{ $mother?->name ?: '-' }}</td></tr>
                <tr><td class="label">NIK</td><td>{{ $mother?->nik ?: '-' }}</td></tr>
                <tr><td class="label">Pekerjaan</td><td>{{ str_replace('_', ' ', ucfirst($mother?->occupation ?? '-')) }}</td></tr>
                <tr><td class="label">Pendidikan</td><td>{{ strtoupper($mother?->education ?? '-') }}</td></tr>
                <tr><td class="label">Penghasilan</td><td>{{ $mother?->monthly_income ?: '-' }}</td></tr>
                <tr><td class="label">Status</td><td>{{ ($mother?->is_alive ?? true) ? 'Masih Hidup' : 'Almarhumah' }}</td></tr>
            </table>
        </div>
    </div>

    @if ($guardian)
        <table class="data" style="margin-top: 6px;">
            <tr><td class="label" colspan="4"><strong>Wali</strong></td></tr>
            <tr><td class="label">Nama</td><td>{{ $guardian->name ?: '-' }}</td>
                <td class="label">NIK</td><td>{{ $guardian->nik ?: '-' }}</td></tr>
            <tr><td class="label">Pekerjaan</td><td>{{ str_replace('_', ' ', ucfirst($guardian->occupation ?? '-')) }}</td>
                <td class="label">Pendidikan</td><td>{{ strtoupper($guardian->education ?? '-') }}</td></tr>
            <tr><td class="label">Penghasilan</td><td>{{ $guardian->monthly_income ?: '-' }}</td>
                <td class="label">No HP / WA</td><td>{{ $guardian->phone ?: '-' }}</td></tr>
        </table>
    @endif

    <table class="data" style="margin-top: 6px;">
        <tr><td class="label">Email Kontak</td><td class="value" colspan="3">{{ $registration->contact_email ?: '-' }}</td></tr>
    </table>

    <div class="signoff">
        <table style="width:100%;">
            <tr>
                <td></td>
                <td style="width: 260px; text-align:center;" class="small">
                    {{ $school['signature_city'] ?: ($school['district'] ?: '') }}{{ ($school['signature_city'] || $school['district']) ? ',' : '' }} {{ optional($registration->submitted_at)->translatedFormat('d F Y') }}<br>
                    {{ $school['principal_title'] ?: 'Kepala Sekolah' }},
                    <div style="margin-top: 60px;">
                        <span class="stamp-line">{{ $school['principal_name'] ?: 'Kepala Sekolah' }}</span>
                        @if(! empty($school['principal_nip']))
                            <div class="nip-line">NIP. {{ $school['principal_nip'] }}</div>
                        @endif
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
