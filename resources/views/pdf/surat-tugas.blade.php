<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Surat Perintah Tugas - {{ $nomor_surat }}</title>
    <style>
        @page { size: legal; margin: 20mm 22mm; }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            color: #000;
            font-family: "DejaVu Serif", "Times New Roman", Times, serif;
            font-size: 12pt;
            line-height: 1.45;
        }

        /* KOP ini mengikuti KOP pada template PDF pendaftaran. */
        .kop { width: 100%; }
        .kop table { width: 100%; border-collapse: collapse; }
        .kop td { vertical-align: middle; }
        .kop-logo { width: 78px; padding-right: 4px; text-align: center; }
        .kop-logo img { width: 70px; height: 78px; object-fit: contain; }
        .kop-logo .logo-fallback {
            display: inline-block;
            width: 65px;
            height: 65px;
            border: 2px dashed #bcccdc;
            border-radius: 50%;
            color: #000;
            font-family: DejaVu Sans, sans-serif;
            font-size: 8pt;
            line-height: 61px;
        }
        .kop-logo-right { width: 78px; padding-left: 4px; text-align: center; }
        .kop-logo-right img { width: 70px; height: 70px; object-fit: contain; }
        .kop-text { padding: 0 6px; text-align: center; }
        .kop-gov {
            margin-bottom: 2px;
            color: #000;
            font-family: "Times New Roman", Times, serif;
            font-size: 14pt;
            font-weight: bold;
            line-height: 1;
            text-transform: uppercase;
        }
        .kop-school {
            margin: 2px 0;
            color: #000;
            font-family: DejaVu Sans, sans-serif;
            font-size: 10pt;
            font-weight: bold;
            letter-spacing: .5pt;
            line-height: 1;
            text-transform: uppercase;
        }
        .kop-address { color: #000; font-family: DejaVu Sans, sans-serif; font-size: 9pt; line-height: 1; }
        .kop-meta { color: #000; font-family: DejaVu Sans, sans-serif; font-size: 8.5pt; line-height: 1; }
        .kop-divider {
            height: 3px;
            margin: 6px 0 18px;
            border-top: 2.5px solid #1e3a5f;
            border-bottom: 1px solid #1e3a5f;
        }

        .title { margin: 0; text-align: center; }
        .title h1 {
            margin: 0;
            font-size: 14pt;
            letter-spacing: .5px;
            text-decoration: underline;
        }
        .number { margin-top: 2px; text-align: center; font-size: 12pt; }
        .opening { margin: 28px 0 0; text-align: justify; }
        table.data { margin: 12px 0 14px 20px; border-collapse: collapse; }
        table.data td { padding: 2px 6px 2px 0; vertical-align: top; }
        table.data td.label { width: 110px; white-space: nowrap; }
        table.data td.colon { width: 14px; }
        .assign-heading { margin: 18px 0 10px; }
        table.assignment-table {
            width: 100%;
            margin: 0 0 16px;
            border-collapse: collapse;
            font-size: 11pt;
        }
        .assignment-table th,
        .assignment-table td {
            padding: 3px 5px;
            border: 1px solid #000;
            vertical-align: top;
        }
        .assignment-table th { text-align: center; }
        .assignment-table .number-col { width: 8%; text-align: center; }
        .assignment-table .name-col { width: 34%; }
        .assignment-table .position-col { width: 28%; }
        .assignment-table .unit-col { width: 30%; }
        .content { margin-top: 18px; text-align: justify; }
        .signature { width: 100%; margin-top: 58px; }
        .signature-wrap { width: 60%; margin-left: auto; text-align: center; }
        .signature-wrap p { margin: 0; }
        .signature-space { height: 70px; }
        .signature-name { margin: 0; font-weight: bold; text-decoration: underline; }
        .signature-nip { margin-top: 0; }
        tr { page-break-inside: avoid; }
    </style>
</head>
<body>
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

    <div class="title">
        <h1>SURAT PERINTAH TUGAS</h1>
        <div class="number">Nomor : {{ $nomor_surat }}</div>
    </div>

    <p class="opening">Yang bertanda tangan di bawah ini:</p>

    <table class="data">
        <tr><td class="label">Nama</td><td class="colon">:</td><td>{{ $principal['name'] }}</td></tr>
        <tr><td class="label">NIP</td><td class="colon">:</td><td>{{ $principal['nip'] }}</td></tr>
        <tr><td class="label">Jabatan</td><td class="colon">:</td><td>{{ $principal['title'] }}</td></tr>
        <tr><td class="label">Unit Kerja</td><td class="colon">:</td><td>{{ $principal['unit_kerja'] }}</td></tr>
    </table>

    <p class="assign-heading">Dengan ini menugaskan:</p>

    @if (count($assignees) === 1)
        <table class="data">
            <tr><td class="label">Nama</td><td class="colon">:</td><td>{{ $assignees[0]['name'] }}</td></tr>
            <tr><td class="label">Jabatan</td><td class="colon">:</td><td>{{ $assignees[0]['position'] }}</td></tr>
            <tr><td class="label">Unit Kerja</td><td class="colon">:</td><td>{{ $assignees[0]['unit_kerja'] }}</td></tr>
        </table>
    @else
        <table class="assignment-table">
            <thead>
                <tr>
                    <th class="number-col">No.</th>
                    <th class="name-col">Nama</th>
                    <th class="position-col">Jabatan</th>
                    <th class="unit-col">Unit Kerja</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($assignees as $index => $assignee)
                    <tr>
                        <td class="number-col">{{ $index + 1 }}</td>
                        <td>{{ $assignee['name'] }}</td>
                        <td>{{ $assignee['position'] }}</td>
                        <td>{{ $assignee['unit_kerja'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <p class="content">
        Untuk mengikuti kegiatan {{ $activity_name }} pada
       {{ $activity_date }} di {{ $activity_place }}.
        Demikian surat penugasan ini dikeluarkan untuk dapat dilaksanakan dengan baik
        dan penuh rasa tanggung jawab. Atas perhatiannya diucapkan terima kasih.
    </p>

    <div class="signature">
        <div class="signature-wrap">
            <p>{{ $letter_place }}, {{ $letter_date }}</p>
            <p>{{ $principal['title'] }}</p>
            <div class="signature-space"></div>
            <p class="signature-name">{{ $principal['name'] }}</p>
            @if ($principal['nip'] !== '-')
                <p class="signature-nip">NIP. {{ $principal['nip'] }}</p>
            @endif
        </div>
    </div>
</body>
</html>
