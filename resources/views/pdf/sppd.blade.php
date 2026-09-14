<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>SPPD - {{ $letter_number }}</title>
    <style>
        @page { size: legal portrait; margin: 12mm 16mm; }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            color: #000;
            font-family: "DejaVu Serif", "Times New Roman", Times, serif;
            font-size: 9pt;
            line-height: 1.25;
        }
        .page { position: relative; height: 330mm; }
        .page-break { page-break-before: always; }
        .page-number { position: absolute; top: 327mm; right: 0; font: 7.5pt DejaVu Sans, sans-serif; color: #444; text-align: right; }

        /* KOP disamakan dengan template PDF surat lain di aplikasi. */
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
            font-family: "Times New Roman", Times, serif;
            font-size: 14pt;
            font-weight: bold;
            line-height: 1;
            text-transform: uppercase;
        }
        .kop-school {
            margin: 2px 0;
            font-family: DejaVu Sans, sans-serif;
            font-size: 10pt;
            font-weight: bold;
            letter-spacing: .5pt;
            line-height: 1;
            text-transform: uppercase;
        }
        .kop-address { font: 9pt/1 DejaVu Sans, sans-serif; }
        .kop-meta { font: 8.5pt/1 DejaVu Sans, sans-serif; }
        .kop-divider { height: 3px; margin: 4px 0 8px; border-top: 2.5px solid #000; border-bottom: 1px solid #000; }

        .doc-title { margin: 7px 0 6px; text-align: center; }
        .doc-title h1 { margin: 0; font-size: 12pt; letter-spacing: .2pt; text-decoration: underline; }
        .doc-title p { margin: 2px 0 0; font-size: 9.5pt; }

        table.sppd { width: 100%; border-collapse: collapse; table-layout: fixed; }
        table.sppd > tbody > tr > td {
            padding: 4px 5px;
            border-top: 1px solid #000;
            border-right: 0;
            border-bottom: 1px solid #000;
            border-left: 0;
            vertical-align: top;
        }
        td.c-no { width: 5%; text-align: center; }
        td.c-label { width: 33%; }
        td.c-colon { width: 3%; text-align: center; }
        td.c-value { width: 59%; }
        table.inner { width: 100%; border-collapse: collapse; }
        table.inner td { padding: 0 3px 1px 0; border: 0; vertical-align: top; }
        table.inner td.num { width: 18px; }
        table.inner td.nip { width: 30px; }
        table.detail { width: 100%; border-collapse: collapse; }
        table.detail td { padding: 0 2px 1px 0; border: 0; vertical-align: top; }
        table.detail td.key { width: 16px; }
        table.detail td.sep { width: 8px; text-align: center; }
        table.followers { width: 100%; margin-top: 3px; border-collapse: collapse; }
        table.followers th, table.followers td {
            padding: 2px 4px;
            border-top: 1px solid #000;
            border-right: 0;
            border-bottom: 1px solid #000;
            border-left: 0;
            font-size: 8.3pt;
            text-align: left;
        }
        table.followers th { text-align: center; font-weight: normal; }
        .multiline { white-space: pre-line; }

        .signature-table { width: 100%; margin-top: 15mm; border-collapse: collapse; }
        .signature-table td { width: 50%; border: 0; vertical-align: top; }
        .signature-box { margin-left: 14px; text-align: center; }
        .signature-box .meta { text-align: left; }
        .signature-space { height: 60px; }
        .signature-name { margin: 0; font-weight: bold; text-decoration: underline; }
        .signature-line { margin: 0; }

        table.log { width: 100%; margin-top: 5px; border-collapse: collapse; table-layout: fixed; font-size: 8.5pt; }
        table.log td {
            padding: 4px 6px;
            border-top: 1px solid #000;
            border-right: 0;
            border-bottom: 1px solid #000;
            border-left: 0;
            vertical-align: top;
        }
        table.log td.num { width: 5%; text-align: center; font-weight: bold; }
        table.log td.half { width: 47.5%; }
        table.fields { width: 100%; border-collapse: collapse; }
        table.fields td { padding: 0 2px 1px 0; border: 0; }
        table.fields td.label { width: 74px; }
        table.fields td.colon { width: 8px; }
        .line { display: inline-block; min-width: 105px; border-bottom: 1px dotted #333; }
        .note { margin: 0 0 2px 82px; font-size: 7.5pt; font-style: italic; }
        .mini-sign { margin-top: 5px; text-align: center; }
        .mini-sign .signature-space { height: 48px; }
        .return-note { padding-left: 8px; text-align: justify; }
        .attention { margin-top: 8px; padding-top: 5px; border-top: 1px solid #000; font-size: 7.6pt; line-height: 1.25; text-align: justify; }
        .attention strong { text-decoration: underline; }
        tr { page-break-inside: avoid; }
    </style>
</head>
<body>
    @php
        $principalRankGrade = implode(' / ', array_filter([$principal['rank'], $principal['grade']]));
    @endphp

    <div class="page">
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

        <div class="doc-title">
            <h1>SURAT PERINTAH PERJALANAN DINAS</h1>
            <p>NOMOR : {{ $letter_number }}</p>
        </div>

        <table class="sppd">
            <tbody>
                <tr>
                    <td class="c-no">1.</td>
                    <td class="c-label">Pejabat berwenang yang memberi perintah</td>
                    <td class="c-colon">:</td>
                    <td class="c-value">{{ $principal['title'] }} {{ $school['name'] }}</td>
                </tr>
                <tr>
                    <td class="c-no">2.</td>
                    <td class="c-label">Nama pegawai yang diberi perintah / NIP</td>
                    <td class="c-colon">:</td>
                    <td class="c-value">
                        <table class="inner">
                            @foreach($travelers as $index => $traveler)
                                <tr>
                                    <td class="num">{{ $index + 1 }}.</td>
                                    <td>{{ $traveler['name'] }}</td>
                                    <td class="nip">NIP.</td>
                                    <td>{{ $traveler['nip'] ?: '-' }}</td>
                                </tr>
                            @endforeach
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">3.</td>
                    <td class="c-label">
                        <table class="detail">
                            <tr><td class="key">a.</td><td>Pangkat dan golongan menurut PGP</td></tr>
                            <tr><td class="key">b.</td><td>Jabatan</td></tr>
                            <tr><td class="key">c.</td><td>Gaji pokok</td></tr>
                            <tr><td class="key">d.</td><td>Tingkat menurut peraturan perjalanan dinas</td></tr>
                        </table>
                    </td>
                    <td class="c-colon">:<br>:<br>:<br>:</td>
                    <td class="c-value">
                        <table class="detail">
                            <tr><td>{{ collect($travelers)->map(fn ($item, $index) => ($index + 1).'. '.(implode(' / ', array_filter([$item['rank'], $item['grade']])) ?: '-'))->implode('; ') }}</td></tr>
                            <tr><td>{{ collect($travelers)->map(fn ($item, $index) => ($index + 1).'. '.($item['position'] ?: '-'))->implode('; ') }}</td></tr>
                            <tr><td>{{ collect($travelers)->map(fn ($item, $index) => ($index + 1).'. '.($item['salary'] ?: '-'))->implode('; ') }}</td></tr>
                            <tr><td>{{ collect($travelers)->map(fn ($item, $index) => ($index + 1).'. '.($item['travel_level'] ?: '-'))->implode('; ') }}</td></tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">4.</td>
                    <td class="c-label">Maksud perjalanan dinas</td>
                    <td class="c-colon">:</td>
                    <td class="c-value multiline">{{ $purpose }}</td>
                </tr>
                <tr>
                    <td class="c-no">5.</td>
                    <td class="c-label">Alat angkut yang dipergunakan</td>
                    <td class="c-colon">:</td>
                    <td class="c-value">{{ $transportation }}</td>
                </tr>
                <tr>
                    <td class="c-no">6.</td>
                    <td class="c-label">
                        <table class="detail">
                            <tr><td class="key">a.</td><td>Tempat berangkat</td></tr>
                            <tr><td class="key">b.</td><td>Tempat tujuan</td></tr>
                        </table>
                    </td>
                    <td class="c-colon">:<br>:</td>
                    <td class="c-value">{{ $departure_place }}<br>{{ $destination }}</td>
                </tr>
                <tr>
                    <td class="c-no">7.</td>
                    <td class="c-label">
                        <table class="detail">
                            <tr><td class="key">a.</td><td>Lamanya perjalanan dinas</td></tr>
                            <tr><td class="key">b.</td><td>Tanggal berangkat</td></tr>
                            <tr><td class="key">c.</td><td>Tanggal harus kembali</td></tr>
                        </table>
                    </td>
                    <td class="c-colon">:<br>:<br>:</td>
                    <td class="c-value">{{ $duration }} hari<br>{{ $departure_date_formatted }}<br>{{ $return_date_formatted }}</td>
                </tr>
                <tr>
                    <td class="c-no">8.</td>
                    <td colspan="3">
                        Pengikut
                        <table class="followers">
                            <thead>
                                <tr><th>Nama</th><th style="width: 12%;">Umur</th><th>Hubungan keluarga / keterangan</th></tr>
                            </thead>
                            <tbody>
                                @forelse($followers as $follower)
                                    <tr>
                                        <td>{{ $follower['name'] ?: '-' }}</td>
                                        <td style="text-align: center;">{{ $follower['age'] ?? '-' }}</td>
                                        <td>{{ $follower['relationship'] ?: '-' }}</td>
                                    </tr>
                                @empty
                                    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                                    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                                @endforelse
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td class="c-no">9.</td>
                    <td class="c-label">a. Instansi<br>b. Mata anggaran</td>
                    <td class="c-colon">:<br>:</td>
                    <td class="c-value">{{ $agency }}<br>{{ $budget_account }}</td>
                </tr>
                <tr>
                    <td class="c-no">10.</td>
                    <td class="c-label">Keterangan lain-lain</td>
                    <td class="c-colon">:</td>
                    <td class="c-value multiline">{{ $other_notes ?: '-' }}</td>
                </tr>
            </tbody>
        </table>

        <table class="signature-table">
            <tr>
                <td></td>
                <td>
                    <div class="signature-box">
                        <div class="meta">Dikeluarkan di : {{ $issue_place }}</div>
                        <div class="meta">Pada tanggal : {{ $issue_date_formatted }}</div>
                        <p>{{ $principal['title'] }}</p>
                        <div class="signature-space"></div>
                        <p class="signature-name">{{ $principal['name'] }}</p>
                        @if($principalRankGrade)
                            <p class="signature-line">{{ $principalRankGrade }}</p>
                        @endif
                        @if($principal['nip'] !== '-')
                            <p class="signature-line">NIP. {{ $principal['nip'] }}</p>
                        @endif
                    </div>
                </td>
            </tr>
        </table>
        <div class="page-number first">Halaman 1 / 2</div>
    </div>

    <div class="page page-break">
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

        <table class="log">
            <tbody>
                <tr>
                    <td class="num">I.</td>
                    <td class="half">
                        <table class="fields">
                            <tr><td class="label">Berangkat dari</td><td class="colon">:</td><td>{{ $departure_place }}</td></tr>
                            <tr><td colspan="3" class="note">(tempat kedudukan)</td></tr>
                            <tr><td class="label">Pada tanggal</td><td class="colon">:</td><td>{{ $departure_date_formatted }}</td></tr>
                            <tr><td class="label">Ke</td><td class="colon">:</td><td>{{ $destination }}</td></tr>
                        </table>
                    </td>
                    <td class="half">
                        <div class="mini-sign">
                            <div>{{ $principal['title'] }}</div>
                            <div class="signature-space"></div>
                            <div class="signature-name">{{ $principal['name'] }}</div>
                            @if($principalRankGrade) <div>{{ $principalRankGrade }}</div> @endif
                            @if($principal['nip'] !== '-') <div>NIP. {{ $principal['nip'] }}</div> @endif
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="num">II.</td>
                    <td class="half">
                        <table class="fields">
                            <tr><td class="label">Tiba di</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                            <tr><td class="label">Pada tanggal</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                        </table>
                        
                    </td>
                    <td class="half">
                        <table class="fields">
                            <tr><td class="label">Berangkat dari</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                            <tr><td class="label">Ke</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                            <tr><td class="label">Pada tanggal</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                        </table>
                        <div class="mini-sign">
                            <div>Pejabat yang berwenang / diberi kuasa</div>
                            <div class="signature-space"></div>
                            <div class="signature-name">( ........................................ )</div>
                            <div>NIP. ........................................</div>
                        </div>
                    </td>
                </tr>
                @foreach(['III.', 'IV.'] as $roman)
                    <tr>
                        <td class="num">{{ $roman }}</td>
                        <td class="half">
                            <table class="fields">
                                <tr><td class="label">Tiba di</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                                <tr><td class="label">Pada tanggal</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                            </table>
                        </td>
                        <td class="half">
                            <table class="fields">
                                <tr><td class="label">Berangkat dari</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                                <tr><td class="label">Ke</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                                <tr><td class="label">Pada tanggal</td><td class="colon">:</td><td><span class="line">&nbsp;</span></td></tr>
                            </table>
                        </td>
                    </tr>
                @endforeach
                <tr>
                    <td class="num">V.</td>
                    <td class="half">
                        <table class="fields">
                            <tr><td class="label">Tiba kembali di</td><td class="colon">:</td><td>{{ $departure_place }}</td></tr>
                            <tr><td colspan="3" class="note">(tempat kedudukan)</td></tr>
                            <tr><td class="label">Pada tanggal</td><td class="colon">:</td><td>{{ $return_date_formatted }}</td></tr>
                        </table>
                    </td>
                    <td class="half">
                        <div class="mini-sign">
                            <div>{{ $principal['title'] }}</div>
                            <div class="signature-space"></div>
                            <div class="signature-name">{{ $principal['name'] }}</div>
                            @if($principalRankGrade) <div>{{ $principalRankGrade }}</div> @endif
                            @if($principal['nip'] !== '-') <div>NIP. {{ $principal['nip'] }}</div> @endif
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="num">VI.</td>
                    <td class="half">
                        <strong>Catatan lain-lain</strong>
                        <div style="min-height: 58px; margin-top: 4px; white-space: pre-line;">{{ $other_notes ?: '' }}</div>
                    </td>
                    <td class="half">
                        <div class="return-note">
                            Telah diperiksa dengan keterangan bahwa perjalanan tersebut di atas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.
                            <div class="mini-sign">
                                <div>{{ $principal['title'] }}</div>
                                <div class="signature-space"></div>
                                <div class="signature-name">{{ $principal['name'] }}</div>
                                @if($principal['nip'] !== '-') <div>NIP. {{ $principal['nip'] }}</div> @endif
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="attention">
            <strong>PERHATIAN:</strong><br>
            Pejabat yang berwenang menerbitkan SPPD, pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendaharawan bertanggung jawab berdasarkan peraturan Keuangan Negara apabila Negara menderita rugi akibat kesalahan, kelalaian, dan kealpaannya (angka 8 Lampiran Surat Menteri Keuangan tanggal 30 April 1974 Nomor B 296/MK/41/1974).
        </div>
        <div class="page-number second">Halaman 2 / 2</div>
    </div>
</body>
</html>
