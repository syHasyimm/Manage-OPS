<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Kartu NISN Siswa</title>
    
    <style>
        @page {
            size: 215.9mm 330.2mm;
            margin: 8mm;
        }

        body {
            font-family: Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #1e293b;
        }

        * {
            box-sizing: border-box;
        }

        .page-break {
            page-break-after: always;
        }

        /* Card size: 8.5cm x 5.5cm */
        .card-front {
            width: 85mm;
            height: 55mm;
            border: 1px solid #bfdbfe;
            overflow: hidden;
            position: relative;
        }
        .card-back {
            width: 85mm;
            height: 55mm;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            position: relative;
            background: #fff;
        }

        /* Card pair: front + back side by side */
        .card-pair { width: 100%; border-collapse: collapse; margin-bottom: 3mm; }
        .card-pair td { vertical-align: top; padding: 0 2mm; }

        /* Inner tables */
        .tbl { width: 100%; border-collapse: collapse; }
        .tbl td { vertical-align: middle; }

        /* Header right block */
        .header-right {
            text-align: right;
            padding: 8px 10px;
            border-bottom-left-radius: 12px;
            color: #fff;
        }

        /* Photo box */
        .photo-box {
            width: 16mm;
            height: 20mm;
            border: 1.5px solid;
            overflow: hidden;
            text-align: center;
        }

        /* Dapodik footer */
        .dapodik-footer {
            position: absolute;
            bottom: 4px;
            left: 0;
            width: 100%;
            text-align: center;
        }

        /* Back card footer */
        .back-footer {
            position: absolute;
            bottom: 3px;
            left: 0;
            width: 100%;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 3px;
        }
    </style>
</head>
<body>
    @foreach($kartus->chunk(5) as $chunkIndex => $chunk)
        @foreach($chunk as $kartu)
            @php
                $siswa = $kartu->siswa;
                $desain = $kartu->desainCard;
                $primary = $desain->warna_primary;
            @endphp

            <table class="card-pair">
                <tr>
                    <!-- ===== FRONT ===== -->
                    <td>
                        <div class="card-front" style="background-color: {{ $primary }}15;">
                            @if($desain->background_depan)
                                <img src="{{ public_path('storage/' . $desain->background_depan) }}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;">
                            @endif

                            <div style="position:relative;z-index:10;">
                                <!-- === HEADER ROW === -->
                                <table class="tbl">
                                    <tr>
                                        <td style="width:55%;padding:4px 4px 2px 6px;">
                                            <table class="tbl">
                                                <tr>
                                                    <td style="width:28px;vertical-align:middle;">
                                                        @if($desain->logo_sekolah)
                                                            <img src="{{ public_path('storage/' . $desain->logo_sekolah) }}" style="width:28px;height:28px;">
                                                        @endif
                                                    </td>
                                                    <td style="vertical-align:middle;padding-left:3px;">
                                                        <div style="font-size:7px;font-weight:bold;color:#1e293b;line-height:1.2;">KEMENTERIAN PENDIDIKAN, BUDAYA,</div>
                                                        <div style="font-size:7px;font-weight:bold;color:#1e293b;line-height:1.2;">RISET DAN TEKNOLOGI</div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                        <td class="header-right" style="width:45%;background-color:{{ $primary }};padding:5px 8px;">
                                            <div style="font-size:11px;font-weight:800;letter-spacing:1px;line-height:1;">KARTU NISN</div>
                                            <div style="font-size:5.5px;font-weight:700;letter-spacing:1.5px;margin-top:2px;opacity:0.9;">NOMOR INDUK SISWA NASIONAL</div>
                                        </td>
                                    </tr>
                                </table>

                                <!-- === NISN LOGO === -->
                                <div style="padding:3px 6px 1px 6px;">
                                    @if($desain->logo_nisn)
                                        <img src="{{ public_path('storage/' . $desain->logo_nisn) }}" style="height:18px;">
                                    @endif
                                </div>

                                <!-- === BODY: PHOTO + INFO === -->
                                <table class="tbl" style="padding:0 5px;">
                                    <tr>
                                        <td style="width:17mm;padding-left:3px;vertical-align:top;">
                                            <div class="photo-box" style="border-color:{{ $primary }}80;background:#eff6ff;">
                                                @if($siswa->foto)
                                                    <img src="{{ public_path('storage/' . $siswa->foto) }}" style="width:100%;height:100%;object-fit:cover;">
                                                @else
                                                    <div style="padding-top:12px;font-size:6px;color:#9ca3af;font-weight:bold;">FOTO<br>3x4</div>
                                                @endif
                                            </div>
                                        </td>
                                        <td style="padding-left:5px;vertical-align:top;">
                                            <table class="tbl" style="font-size:9px;color:#1e293b;">
                                                <tr>
                                                    <td style="width:48px;font-weight:bold;padding:1.5px 0;">Nama</td>
                                                    <td style="width:6px;text-align:center;padding:1.5px 0;">:</td>
                                                    <td style="padding:1.5px 0;">{{ $siswa->nama }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight:bold;padding:1.5px 0;">NIS</td>
                                                    <td style="text-align:center;padding:1.5px 0;">:</td>
                                                    <td style="padding:1.5px 0;">{{ $siswa->nis }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight:bold;padding:1.5px 0;">NISN</td>
                                                    <td style="text-align:center;padding:1.5px 0;">:</td>
                                                    <td style="padding:1.5px 0;">{{ $siswa->nisn ?? '-' }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight:bold;padding:1.5px 0;">Kelas</td>
                                                    <td style="text-align:center;padding:1.5px 0;">:</td>
                                                    <td style="padding:1.5px 0;">{{ $siswa->kelas }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight:bold;padding:1.5px 0;">Tempat Lahir</td>
                                                    <td style="text-align:center;padding:1.5px 0;">:</td>
                                                    <td style="padding:1.5px 0;">{{ $siswa->tempat_lahir ?? '-' }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight:bold;padding:1.5px 0;">Tgl. Lahir</td>
                                                    <td style="text-align:center;padding:1.5px 0;">:</td>
                                                    <td style="padding:1.5px 0;">{{ $siswa->tanggal_lahir ? $siswa->tanggal_lahir->format('d/m/Y') : '-' }}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- === DAPODIK LOGO === -->
                                <div class="dapodik-footer">
                                    @if($desain->logo_dapodik)
                                        <img src="{{ public_path('storage/' . $desain->logo_dapodik) }}" style="height:28px;">
                                    @endif
                                </div>
                            </div>
                        </div>
                    </td>

                    <!-- ===== BACK ===== -->
                    <td>
                        <div class="card-back">
                            <!-- Header Banner -->
                            <div style="background-color:{{ $primary }};padding:8px 14px;text-align:center;">
                                <div style="font-size:14px;font-weight:800;color:#fff;letter-spacing:2px;line-height:1;">KARTU NISN</div>
                                <div style="font-size:7px;font-weight:600;color:#fff;opacity:0.85;margin-top:3px;letter-spacing:1px;">NOMOR INDUK SISWA NASIONAL</div>
                            </div>

                            <!-- School Name -->
                            <div style="text-align:center;padding:5px 12px 4px 12px;border-bottom:1px solid #e2e8f0;margin:0 10px;">
                                <div style="font-size:9px;font-weight:700;color:{{ $primary }};letter-spacing:0.5px;">{{ $desain->nama_sekolah ?? 'Nama Sekolah' }}</div>
                            </div>
                            
                            <!-- Info Table -->
                            <table class="tbl" style="font-size:9px;color:#334155;padding:4px 12px;">
                                <tr>
                                    <td style="font-weight:700;padding:2px 0;width:75px;color:#1e293b;">Alamat Siswa</td>
                                    <td style="width:8px;text-align:center;padding:2px 0;">:</td>
                                    <td style="padding:2px 0;">{{ $siswa->alamat ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight:700;padding:2px 0;color:#1e293b;">Sekolah</td>
                                    <td style="text-align:center;padding:2px 0;">:</td>
                                    <td style="padding:2px 0;">{{ $desain->nama_sekolah ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight:700;padding:2px 0;color:#1e293b;">Alamat Sekolah</td>
                                    <td style="text-align:center;padding:2px 0;">:</td>
                                    <td style="padding:2px 0;">{{ $desain->alamat_sekolah ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight:700;padding:2px 0;color:#1e293b;">Tahun Ajaran</td>
                                    <td style="text-align:center;padding:2px 0;">:</td>
                                    <td style="padding:2px 0;">{{ $siswa->tahun_ajaran ?? '-' }}</td>
                                </tr>
                            </table>

                            <!-- Footer -->
                            <div class="back-footer" style="padding:4px 10px 3px 10px;">
                                <div style="border-top:1px solid {{ $primary }}40;padding-top:3px;text-align:center;">
                                    <p style="font-size:6.5px;font-style:italic;color:#64748b;margin:0 0 1px 0;">Kartu ini merupakan identitas resmi pelajar dan berlaku selama masa studi.</p>
                                    <p style="font-size:5.5px;color:#94a3b8;margin:0;">Dicetak {{ now()->format('d/m/Y') }} &bull; Data Pokok Pendidikan (DAPODIK)</p>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            </table>

        @endforeach

        @if(!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>
</html>
