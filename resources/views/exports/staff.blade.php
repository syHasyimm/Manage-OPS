<table>
    <thead>
        <tr>
            <th colspan="{{ count($columns) + 1 }}" style="font-weight: bold; font-size: 14px; text-align: center;">
                DATA GURU DAN TENAGA KEPENDIDIKAN
            </th>
        </tr>
        <tr>
            <th style="width: 50px;">NO</th>
            @if(in_array('name', $columns)) <th style="width: 250px;">NAMA LENGKAP</th> @endif
            @if(in_array('nip', $columns)) <th style="width: 180px;">NIP</th> @endif
            @if(in_array('nuptk', $columns)) <th style="width: 150px;">NUPTK</th> @endif
            @if(in_array('nik', $columns)) <th style="width: 150px;">NIK</th> @endif
            @if(in_array('birth_info', $columns)) <th style="width: 200px;">TEMPAT, TANGGAL LAHIR</th> @endif
            @if(in_array('jabatan', $columns)) <th style="width: 150px;">JABATAN</th> @endif
            @if(in_array('pangkat', $columns)) <th style="width: 150px;">PANGKAT</th> @endif
            @if(in_array('golongan', $columns)) <th style="width: 100px;">GOLONGAN</th> @endif
            @if(in_array('jenis', $columns)) <th style="width: 100px;">JENIS</th> @endif
        </tr>
    </thead>
    <tbody>
        @foreach($staff as $index => $item)
            <tr>
                <td>{{ $index + 1 }}</td>
                @if(in_array('name', $columns)) <td>{{ $item->name }}</td> @endif
                @if(in_array('nip', $columns)) <td>{{ $item->nip ? "'".$item->nip : '' }}</td> @endif
                @if(in_array('nuptk', $columns)) <td>{{ $item->nuptk ? "'".$item->nuptk : '' }}</td> @endif
                @if(in_array('nik', $columns)) <td>{{ "'".$item->nik }}</td> @endif
                @if(in_array('birth_info', $columns)) 
                    <td>{{ $item->birth_place }}, {{ $item->birth_date?->format('d-m-Y') }}</td> 
                @endif
                @if(in_array('jabatan', $columns)) <td>{{ $item->jabatan }}</td> @endif
                @if(in_array('pangkat', $columns)) <td>{{ $item->pangkat }}</td> @endif
                @if(in_array('golongan', $columns)) <td>{{ $item->golongan }}</td> @endif
                @if(in_array('jenis', $columns)) <td>{{ ucfirst($item->jenis) }}</td> @endif
            </tr>
        @endforeach
        @if(count($staff) === 0)
            <tr>
                <td colspan="{{ count($columns) + 1 }}" style="text-align: center;">Tidak ada data guru/tendik.</td>
            </tr>
        @endif
    </tbody>
</table>
