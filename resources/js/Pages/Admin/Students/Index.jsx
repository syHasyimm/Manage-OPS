import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Edit3,
    FileSpreadsheet,
    FileArchive,
    Plus,
    Search,
    Trash2,
    User,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

export default function Index({ students, filters, grades, religions }) {
    const [form, setForm] = useState({
        q: filters?.q ?? '',
        tingkat: filters?.tingkat ?? '',
    });
    const religionLabels = Object.fromEntries((religions ?? []).map((religion) => [religion.value, religion.label]));

    const apply = (event) => {
        event?.preventDefault?.();
        const params = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== '' && value !== null));
        router.get(route('admin.students.index'), params, { preserveState: true, replace: true });
    };

    const reset = () => {
        setForm({ q: '', tingkat: '' });
        router.get(route('admin.students.index'));
    };

    const remove = (student) => {
        if (! window.confirm(`Hapus data ${student.name}?`)) return;

        router.delete(route('admin.students.destroy', { student: student.id }), { preserveScroll: true });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Data Siswa</h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('admin.students.import-photos.create')}>
                                <FileArchive className="h-4 w-4" />
                                Upload Foto (ZIP)
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={route('admin.students.import.create')}>
                                <FileSpreadsheet className="h-4 w-4" />
                                Import Excel
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.students.create')}>
                                <Plus className="h-4 w-4" />
                                Tambah Manual
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Admin - Data Siswa" />

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Search className="h-4 w-4" />
                        Cari Data Siswa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={apply} className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]">
                        <Input
                            placeholder="Nama / NIS / NISN / NIK"
                            value={form.q}
                            onChange={(event) => setForm({ ...form, q: event.target.value })}
                        />
                        <Select
                            value={form.tingkat || 'all'}
                            onValueChange={(value) => setForm({ ...form, tingkat: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua tingkat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua tingkat</SelectItem>
                                {grades.map((grade) => (
                                    <SelectItem key={grade} value={String(grade)}>
                                        Kelas {grade}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
                        <Button type="submit">Terapkan</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <p className="px-4 pt-3 text-xs text-navy-500 sm:hidden">
                        Geser tabel ke samping untuk melihat semua kolom.
                    </p>
                    <Table className="min-w-[1050px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Siswa</TableHead>
                                <TableHead>NIS / NISN</TableHead>
                                <TableHead>NIK</TableHead>
                                <TableHead>No Ortu</TableHead>
                                <TableHead>Nama Ortu</TableHead>
                                <TableHead>Tempat, Tanggal Lahir</TableHead>
                                <TableHead>Agama</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-10 text-center text-sm text-navy-500">
                                        Belum ada data siswa.
                                    </TableCell>
                                </TableRow>
                            )}
                            {students.data.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-50">
                                                {student.photo_url ? (
                                                    <img src={student.photo_url} alt={`Foto ${student.name}`} className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-5 w-5 text-navy-300" />
                                                )}
                                            </div>
                                            <span className="min-w-[170px] font-medium text-navy-900">{student.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-xs text-navy-700">
                                        <div>NIS: {student.nis}</div>
                                        <div className="text-navy-500">NISN: {student.nisn}</div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap font-mono text-xs">{student.nik}</TableCell>
                                    <TableCell className="whitespace-nowrap text-xs">{student.parent_phone}</TableCell>
                                    <TableCell className="whitespace-nowrap text-xs">{student.parent_name}</TableCell>
                                    <TableCell className="whitespace-nowrap text-xs">
                                        {student.birth_place}, {new Date(student.birth_date).toLocaleDateString('id-ID')}
                                    </TableCell>
                                    <TableCell>{religionLabels[student.religion] ?? student.religion}</TableCell>
                                    <TableCell><Badge variant="outline">{student.kelas}</Badge></TableCell>
                                    <TableCell className="whitespace-nowrap text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={route('admin.students.edit', { student: student.id })}>
                                                <Edit3 className="h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(student)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Hapus
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {students.links?.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {students.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url ?? '#'}
                            preserveScroll
                            preserveState
                            className={
                                'rounded-md border px-3 py-1.5 text-sm ' +
                                (link.active
                                    ? 'border-navy-900 bg-navy-900 text-white'
                                    : link.url
                                    ? 'border-navy-200 bg-white text-navy-800 hover:bg-navy-50'
                                    : 'border-navy-100 bg-navy-50 text-navy-300 cursor-not-allowed')
                            }
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
