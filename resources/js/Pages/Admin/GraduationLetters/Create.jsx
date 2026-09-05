import { Head, useForm, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    AlertTriangle,
    Award,
    ChevronLeft,
    Loader2,
    Save,
    Search,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { toast } from 'sonner';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-red-600">{message}</p>;
}

function Field({ label, htmlFor, hint, error, children, required }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-xs text-navy-500">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}

export default function Create({ students, principal, defaults, defaultGrades }) {
    const [studentSearch, setStudentSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        letter_number: '',
        decree_number: '',
        decree_date: '',
        regulation_number: defaults.regulation_number ?? '22',
        regulation_year: defaults.regulation_year ?? 2024,
        academic_year: defaults.academic_year ?? '',
        graduation_status: 'LULUS',
        grades: defaultGrades ?? [],
        issued_city: defaults.issued_city ?? '',
        issued_date: defaults.issued_date ?? '',
    });

    const filteredStudents = useMemo(() => {
        if (!studentSearch || studentSearch.length < 2) return [];
        const q = studentSearch.toLowerCase();
        return students
            .filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    (s.nis && s.nis.toLowerCase().includes(q)) ||
                    (s.nisn && s.nisn.toLowerCase().includes(q)),
            )
            .slice(0, 8);
    }, [studentSearch, students]);

    const RELIGION_MAPELS = {
        islam: 'Pendidikan Agama Islam dan Budi Pekerti',
        kristen: 'Pendidikan Agama Kristen dan Budi Pekerti',
        katholik: 'Pendidikan Agama Katolik dan Budi Pekerti',
        hindu: 'Pendidikan Agama Hindu dan Budi Pekerti',
        budha: 'Pendidikan Agama Buddha dan Budi Pekerti',
        khonghucu: 'Pendidikan Agama Khonghucu dan Budi Pekerti',
        kepercayaan: 'Pendidikan Kepercayaan Terhadap Tuhan YME dan Budi Pekerti'
    };

    const selectStudent = (student) => {
        setSelectedStudent(student);
        setStudentSearch('');

        let newGrades = [...data.grades];
        if (student.religion && newGrades[0]) {
            const mappedMapel = RELIGION_MAPELS[student.religion.toLowerCase()];
            if (mappedMapel) {
                newGrades[0] = { ...newGrades[0], mapel: mappedMapel };
            }
        }

        setData((prev) => ({
            ...prev,
            student_id: student.id,
            grades: newGrades,
        }));
    };

    const updateGrade = (index, value) => {
        const grades = data.grades.map((grade, i) =>
            i === index ? { ...grade, nilai: value === '' ? null : Number(value) } : grade,
        );
        setData('grades', grades);
    };


    const updateMapelName = (index, value) => {
        const grades = data.grades.map((grade, i) =>
            i === index ? { ...grade, mapel: value } : grade,
        );
        setData('grades', grades);
    };

    const averageScore = useMemo(() => {
        const filled = data.grades.filter((g) => g.nilai !== null && g.nilai !== undefined && g.nilai !== '');
        if (filled.length === 0) return '0.00';
        const sum = filled.reduce((acc, g) => acc + Number(g.nilai), 0);
        return (sum / filled.length).toFixed(2);
    }, [data.grades]);

    const principalIncomplete = !principal?.name || !principal?.nip;

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.graduation-letters.store'), {
            preserveScroll: true,
            onSuccess: () => toast.success('SKL berhasil dibuat!'),
            onError: () => toast.error('Gagal membuat SKL. Periksa kembali isian.'),
        });
    };

    const groupedGrades = useMemo(() => {
        const groups = {};
        (data.grades ?? []).forEach((grade, index) => {
            const key = grade.kelompok;
            if (!groups[key]) groups[key] = [];
            groups[key].push({ ...grade, _index: index });
        });
        return groups;
    }, [data.grades]);

    return (
        <AdminLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('admin.graduation-letters.index')}>
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Buat SKL Baru</h1>
                        <p className="mt-1 text-xs text-navy-500">
                            Buat Surat Keterangan Kelulusan dengan data siswa dan nilai.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Buat SKL" />

            <form onSubmit={submit} className="space-y-4">
                {principalIncomplete && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                            Data nama atau NIP Kepala Sekolah belum lengkap. Lengkapi melalui{' '}
                            <a href={route('admin.school-settings.edit')} className="font-semibold underline">
                                Pengaturan Sekolah
                            </a>{' '}
                            sebelum mencetak surat.
                        </p>
                    </div>
                )}

                {/* ===== PILIH SISWA ===== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Award className="h-4 w-4" />
                            Pilih Siswa
                        </CardTitle>
                        <CardDescription>Cari dan pilih siswa yang akan dibuatkan SKL.</CardDescription>
                        <FieldError message={errors.student_id} />
                    </CardHeader>
                    <CardContent>
                        {!selectedStudent ? (
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                                    <Input
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        placeholder="Cari siswa kelas 6 (ketik nama, NIS, atau NISN)..."
                                        className="pl-9"
                                    />
                                </div>
                                {filteredStudents.length > 0 && (
                                    <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-navy-100 p-2">
                                        {filteredStudents.map((s) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => selectStudent(s)}
                                                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-navy-50"
                                            >
                                                <div>
                                                    <p className="font-medium text-navy-900">{s.name}</p>
                                                    <p className="text-xs text-navy-500">
                                                        NIS: {s.nis} &middot; NISN: {s.nisn} &middot; Kelas: {s.kelas}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {studentSearch.length >= 2 && filteredStudents.length === 0 && (
                                    <p className="py-4 text-center text-xs text-navy-400">Siswa tidak ditemukan.</p>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-4">
                                <div className="flex items-start justify-between">
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <p className="text-xs text-navy-500">Nama</p>
                                            <p className="mt-0.5 text-sm font-semibold text-navy-900">{selectedStudent.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-navy-500">NIS / NISN</p>
                                            <p className="mt-0.5 text-sm text-navy-900">{selectedStudent.nis} / {selectedStudent.nisn}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-navy-500">Jenis Kelamin</p>
                                            <p className="mt-0.5 text-sm text-navy-900">{selectedStudent.gender || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-navy-500">Tempat, Tanggal Lahir</p>
                                            <p className="mt-0.5 text-sm text-navy-900">
                                                {selectedStudent.birth_place}, {selectedStudent.birth_date}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-navy-500">Nama Orang Tua</p>
                                            <p className="mt-0.5 text-sm text-navy-900">{selectedStudent.parent_name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-navy-500">Sekolah Asal</p>
                                            <p className="mt-0.5 text-sm text-navy-900">{selectedStudent.previous_school || '-'}</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedStudent(null);
                                            setData('student_id', '');
                                        }}
                                    >
                                        Ganti
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ===== IDENTITAS SURAT ===== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Identitas Surat</CardTitle>
                        <CardDescription>Nomor surat, SK kelulusan, dan dasar hukum.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Nomor Surat SKL" htmlFor="letter_number" error={errors.letter_number} required>
                                <Input
                                    id="letter_number"
                                    value={data.letter_number}
                                    onChange={(e) => setData('letter_number', e.target.value)}
                                    placeholder="400.3.11.1/SDN001-KEP/037"
                                    required
                                />
                            </Field>
                            <Field label="Tahun Pelajaran" htmlFor="academic_year" error={errors.academic_year} required>
                                <Input
                                    id="academic_year"
                                    value={data.academic_year}
                                    onChange={(e) => setData('academic_year', e.target.value)}
                                    placeholder="2025/2026"
                                    required
                                />
                            </Field>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Nomor SK Kelulusan" htmlFor="decree_number" error={errors.decree_number} required>
                                <Input
                                    id="decree_number"
                                    value={data.decree_number}
                                    onChange={(e) => setData('decree_number', e.target.value)}
                                    placeholder="Kpts.400.3.11.1/SDN001-KEP/036"
                                    required
                                />
                            </Field>
                            <Field label="Tanggal SK Kelulusan" htmlFor="decree_date" error={errors.decree_date} required>
                                <Input
                                    id="decree_date"
                                    type="date"
                                    value={data.decree_date}
                                    onChange={(e) => setData('decree_date', e.target.value)}
                                    required
                                />
                            </Field>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Nomor Permendikbud" htmlFor="regulation_number" error={errors.regulation_number} required>
                                <Input
                                    id="regulation_number"
                                    value={data.regulation_number}
                                    onChange={(e) => setData('regulation_number', e.target.value)}
                                    placeholder="22"
                                    required
                                />
                            </Field>
                            <Field label="Tahun Permendikbud" htmlFor="regulation_year" error={errors.regulation_year} required>
                                <Input
                                    id="regulation_year"
                                    type="number"
                                    value={data.regulation_year}
                                    onChange={(e) => setData('regulation_year', Number(e.target.value))}
                                    placeholder="2024"
                                    required
                                />
                            </Field>
                        </div>
                        <Field label="Status Kelulusan" htmlFor="graduation_status" error={errors.graduation_status} required>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="graduation_status"
                                        value="LULUS"
                                        checked={data.graduation_status === 'LULUS'}
                                        onChange={(e) => setData('graduation_status', e.target.value)}
                                        className="accent-navy-900"
                                    />
                                    <Badge>LULUS</Badge>
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="graduation_status"
                                        value="TIDAK LULUS"
                                        checked={data.graduation_status === 'TIDAK LULUS'}
                                        onChange={(e) => setData('graduation_status', e.target.value)}
                                        className="accent-red-600"
                                    />
                                    <Badge variant="destructive">TIDAK LULUS</Badge>
                                </label>
                            </div>
                        </Field>
                    </CardContent>
                </Card>

                {/* ===== TABEL NILAI ===== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Nilai Ujian (Nilai Ijazah)</CardTitle>
                        <CardDescription>Isi nilai per mata pelajaran. Rata-rata dihitung otomatis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-lg border border-navy-100">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-navy-100 bg-navy-50">
                                        <th className="px-3 py-2 text-left font-medium text-navy-600 w-10">No</th>
                                        <th className="px-3 py-2 text-left font-medium text-navy-600">Mata Pelajaran</th>
                                        <th className="px-3 py-2 text-center font-medium text-navy-600 w-28">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(groupedGrades).map(([kelompok, items]) => (
                                        <>
                                            <tr key={`header-${kelompok}`} className="bg-navy-50/50">
                                                <td colSpan={3} className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-navy-700">
                                                    Kelompok {kelompok}
                                                </td>
                                            </tr>
                                            {items.map((grade) => (
                                                <tr key={grade._index} className="border-b border-navy-50 last:border-0">
                                                    <td className="px-3 py-2 text-center text-navy-400">
                                                        {grade.jenis !== 'mulok' ? `${grade.urutan}.` : ''}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {grade.jenis === 'mulok' ? (
                                                            <div className="flex items-center gap-2 pl-4">
                                                                <Select
                                                                    value={grade.mapel || 'none'}
                                                                    onValueChange={(value) => updateMapelName(grade._index, value === 'none' ? '' : value)}
                                                                >
                                                                    <SelectTrigger className="h-8 text-sm">
                                                                        <SelectValue placeholder="Pilih Muatan Lokal" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="none">Pilih Muatan Lokal</SelectItem>
                                                                        <SelectItem value="Muatan Lokal Bahasa Daerah">Muatan Lokal Bahasa Daerah</SelectItem>
                                                                        <SelectItem value="Muatan Lokal Prakarya dan Keterampilan">Muatan Lokal Prakarya dan Keterampilan</SelectItem>
                                                                        <SelectItem value="Muatan Lokal Potensi Khusus Wilayah">Muatan Lokal Potensi Khusus Wilayah</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        ) : (
                                                            <Input
                                                                value={grade.mapel ?? ''}
                                                                onChange={(e) => updateMapelName(grade._index, e.target.value)}
                                                                className="h-8 max-w-[320px] text-sm font-medium border-transparent hover:border-navy-200 focus:border-navy-500 shadow-none px-2"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={grade.nilai ?? ''}
                                                            onChange={(e) => updateGrade(grade._index, e.target.value)}
                                                            className="h-8 text-center text-sm"
                                                        />
                                                        <FieldError message={errors[`grades.${grade._index}.nilai`]} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                    <tr className="border-t-2 border-navy-200 bg-navy-50/80">
                                        <td colSpan={2} className="px-3 py-2.5 text-right font-bold text-navy-800">
                                            Rata-rata
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            <span className="rounded-md bg-navy-900 px-3 py-1 text-sm font-bold text-white">
                                                {averageScore}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* ===== TEMPAT & TANGGAL SURAT ===== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Tempat dan Tanggal Surat</CardTitle>
                        <CardDescription>Bagian ini dicetak di atas nama Kepala Sekolah.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Tempat Terbit" htmlFor="issued_city" error={errors.issued_city} required>
                                <Input
                                    id="issued_city"
                                    value={data.issued_city}
                                    onChange={(e) => setData('issued_city', e.target.value)}
                                    placeholder="Kepenuhan"
                                    required
                                />
                            </Field>
                            <Field label="Tanggal Terbit" htmlFor="issued_date" error={errors.issued_date} required>
                                <Input
                                    id="issued_date"
                                    type="date"
                                    value={data.issued_date}
                                    onChange={(e) => setData('issued_date', e.target.value)}
                                    required
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                {/* ===== DATA KEPALA SEKOLAH ===== */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Data Kepala Sekolah</CardTitle>
                        <CardDescription>Data ini di-snapshot dari Pengaturan Sekolah saat SKL dibuat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 rounded-lg border border-navy-100 bg-navy-50/50 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-navy-500">Nama</p>
                                <p className="mt-0.5 text-sm font-semibold text-navy-900">{principal?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-navy-500">NIP</p>
                                <p className="mt-0.5 text-sm font-semibold text-navy-900">{principal?.nip || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pb-8">
                    <Link href={route('admin.graduation-letters.index')}>
                        <Button type="button" variant="outline">Batal</Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Simpan SKL
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
