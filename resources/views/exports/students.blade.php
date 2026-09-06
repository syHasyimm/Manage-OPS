<table>
    <thead>
        <tr>
            <th colspan="{{ count($columns) + 1 }}" style="font-weight: bold; font-size: 14px; text-align: center;">
                BUKU INDUK SISWA
            </th>
        </tr>
        <tr>
            <th style="width: 50px;">NO</th>
            @if(in_array('nis', $columns)) <th style="width: 120px;">NIS</th> @endif
            @if(in_array('nisn', $columns)) <th style="width: 120px;">NISN</th> @endif
            @if(in_array('nik', $columns)) <th style="width: 150px;">NIK</th> @endif
            @if(in_array('name', $columns)) <th style="width: 250px;">NAMA LENGKAP</th> @endif
            @if(in_array('gender', $columns)) <th style="width: 100px;">JENIS KELAMIN</th> @endif
            @if(in_array('birth_info', $columns)) <th style="width: 200px;">TEMPAT, TANGGAL LAHIR</th> @endif
            @if(in_array('religion', $columns)) <th style="width: 100px;">AGAMA</th> @endif
            @if(in_array('kelas', $columns)) <th style="width: 80px;">KELAS</th> @endif
            @if(in_array('address', $columns)) <th style="width: 300px;">ALAMAT</th> @endif
            @if(in_array('parent_name', $columns)) <th style="width: 200px;">NAMA ORANG TUA</th> @endif
            @if(in_array('parent_phone', $columns)) <th style="width: 150px;">NO HP ORANG TUA</th> @endif
            @if(in_array('previous_school', $columns)) <th style="width: 200px;">ASAL SEKOLAH</th> @endif
        </tr>
    </thead>
    <tbody>
        @foreach($students as $index => $student)
            <tr>
                <td>{{ $index + 1 }}</td>
                @if(in_array('nis', $columns)) <td>{{ $student->nis }}</td> @endif
                @if(in_array('nisn', $columns)) <td>{{ "'".$student->nisn }}</td> @endif
                @if(in_array('nik', $columns)) <td>{{ "'".$student->nik }}</td> @endif
                @if(in_array('name', $columns)) <td>{{ $student->name }}</td> @endif
                @if(in_array('gender', $columns)) 
                    <td>{{ $student->gender === 'L' ? 'Laki-Laki' : 'Perempuan' }}</td> 
                @endif
                @if(in_array('birth_info', $columns)) 
                    <td>{{ $student->birth_place }}, {{ $student->birth_date?->format('d-m-Y') }}</td> 
                @endif
                @if(in_array('religion', $columns)) <td>{{ ucfirst($student->religion) }}</td> @endif
                @if(in_array('kelas', $columns)) <td>{{ $student->kelas }}</td> @endif
                @if(in_array('address', $columns)) <td>{{ $student->address }}</td> @endif
                @if(in_array('parent_name', $columns)) <td>{{ $student->parent_name }}</td> @endif
                @if(in_array('parent_phone', $columns)) <td>{{ "'".$student->parent_phone }}</td> @endif
                @if(in_array('previous_school', $columns)) <td>{{ $student->previous_school }}</td> @endif
            </tr>
        @endforeach
        @if(count($students) === 0)
            <tr>
                <td colspan="{{ count($columns) + 1 }}" style="text-align: center;">Tidak ada data siswa.</td>
            </tr>
        @endif
    </tbody>
</table>
