import { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Trash2, Printer, Search, Upload } from 'lucide-react';

export default function KartuNisnIndex({ auth, desain, students, filters, grades }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        warna_primary: desain.warna_primary || '#1d4ed8',
        nama_sekolah: desain.nama_sekolah || '',
        alamat_sekolah: desain.alamat_sekolah || '',
        logo_sekolah: null,
        logo_nisn: null,
        logo_dapodik: null,
        background_depan: null,
    });

    const [search, setSearch] = useState(filters.q || '');
    const [selectedTingkat, setSelectedTingkat] = useState(filters.tingkat || '');
    const [selectedStudents, setSelectedStudents] = useState([]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('admin.kartu-nisn.index'),
            { q: search, tingkat: selectedTingkat },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterTingkat = (val) => {
        setSelectedTingkat(val);
        router.get(
            route('admin.kartu-nisn.index'),
            { q: search, tingkat: val },
            { preserveState: true, replace: true }
        );
    };

    const submitDesain = (e) => {
        e.preventDefault();
        post(route('admin.kartu-nisn.desain.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setData({
                    ...data,
                    logo_sekolah: null,
                    logo_nisn: null,
                    logo_dapodik: null,
                    background_depan: null,
                });
            }
        });
    };

    const deleteAsset = (field) => {
        if (confirm('Hapus gambar ini?')) {
            router.delete(route('admin.kartu-nisn.desain.asset.destroy', field), {
                preserveScroll: true,
            });
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedStudents(students.data.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (checked, id) => {
        if (checked) {
            setSelectedStudents([...selectedStudents, id]);
        } else {
            setSelectedStudents(selectedStudents.filter(sid => sid !== id));
        }
    };

    const handlePrint = () => {
        if (selectedStudents.length === 0 && !selectedTingkat) {
            if (!confirm('Anda tidak memilih siswa atau filter kelas tertentu. Ini akan mencetak maksimal 500 siswa. Lanjutkan?')) {
                return;
            }
        }

        const query = new URLSearchParams();
        if (selectedStudents.length > 0) {
            selectedStudents.forEach(id => query.append('student_ids[]', id));
        } else if (selectedTingkat) {
            query.append('tingkat', selectedTingkat);
        }

        window.open(`${route('admin.kartu-nisn.print')}?${query.toString()}`, '_blank');
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Cetak Kartu NISN" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kartu NISN</h1>
                        <p className="text-muted-foreground mt-1">
                            Atur desain dan cetak kartu Nomor Induk Siswa Nasional.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* PANEL KIRI: DESAIN */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pengaturan Desain</CardTitle>
                                <CardDescription>Sesuaikan tampilan kartu NISN.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submitDesain} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="warna_primary">Warna Primary</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="warna_primary"
                                                type="color"
                                                className="w-14 h-10 p-1 cursor-pointer"
                                                value={data.warna_primary}
                                                onChange={e => setData('warna_primary', e.target.value)}
                                            />
                                            <Input
                                                type="text"
                                                className="flex-1 uppercase"
                                                value={data.warna_primary}
                                                onChange={e => setData('warna_primary', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.warna_primary} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="nama_sekolah">Nama Sekolah di Kartu</Label>
                                        <Input
                                            id="nama_sekolah"
                                            value={data.nama_sekolah}
                                            onChange={e => setData('nama_sekolah', e.target.value)}
                                        />
                                        <InputError message={errors.nama_sekolah} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="alamat_sekolah">Alamat Sekolah di Kartu (Belakang)</Label>
                                        <Textarea
                                            id="alamat_sekolah"
                                            rows={3}
                                            value={data.alamat_sekolah}
                                            onChange={e => setData('alamat_sekolah', e.target.value)}
                                        />
                                        <InputError message={errors.alamat_sekolah} />
                                    </div>

                                    {/* Uploads */}
                                    <div className="space-y-4 pt-4 border-t">
                                        <div>
                                            <Label>Logo Sekolah</Label>
                                            <div className="flex items-center gap-3 mt-1">
                                                {desain.logo_sekolah ? (
                                                    <div className="relative group w-16 h-16 border rounded bg-slate-50 flex items-center justify-center">
                                                        <img src={desain.logo_sekolah} alt="Logo Sekolah" className="max-h-full max-w-full object-contain" />
                                                        <button type="button" onClick={() => deleteAsset('logo_sekolah')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Input type="file" accept="image/*" onChange={e => setData('logo_sekolah', e.target.files[0])} />
                                                )}
                                            </div>
                                            <InputError message={errors.logo_sekolah} className="mt-1" />
                                        </div>

                                        <div>
                                            <Label>Logo NISN</Label>
                                            <div className="flex items-center gap-3 mt-1">
                                                {desain.logo_nisn ? (
                                                    <div className="relative group w-16 h-16 border rounded bg-slate-50 flex items-center justify-center">
                                                        <img src={desain.logo_nisn} alt="Logo NISN" className="max-h-full max-w-full object-contain" />
                                                        <button type="button" onClick={() => deleteAsset('logo_nisn')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Input type="file" accept="image/*" onChange={e => setData('logo_nisn', e.target.files[0])} />
                                                )}
                                            </div>
                                            <InputError message={errors.logo_nisn} className="mt-1" />
                                        </div>

                                        <div>
                                            <Label>Logo Dapodik</Label>
                                            <div className="flex items-center gap-3 mt-1">
                                                {desain.logo_dapodik ? (
                                                    <div className="relative group w-16 h-16 border rounded bg-slate-50 flex items-center justify-center">
                                                        <img src={desain.logo_dapodik} alt="Logo Dapodik" className="max-h-full max-w-full object-contain" />
                                                        <button type="button" onClick={() => deleteAsset('logo_dapodik')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Input type="file" accept="image/*" onChange={e => setData('logo_dapodik', e.target.files[0])} />
                                                )}
                                            </div>
                                            <InputError message={errors.logo_dapodik} className="mt-1" />
                                        </div>

                                        <div>
                                            <Label>Background Depan</Label>
                                            <div className="flex flex-col gap-2 mt-1">
                                                {desain.background_depan ? (
                                                    <div className="relative group w-full h-24 border rounded overflow-hidden">
                                                        <img src={desain.background_depan} alt="Background" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => deleteAsset('background_depan')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Input type="file" accept="image/*" onChange={e => setData('background_depan', e.target.files[0])} />
                                                )}
                                            </div>
                                            <InputError message={errors.background_depan} className="mt-1" />
                                        </div>
                                    </div>

                                    <Button type="submit" disabled={processing} className="w-full">
                                        {processing ? 'Menyimpan...' : 'Simpan Desain'}
                                    </Button>

                                    {recentlySuccessful && (
                                        <p className="text-sm text-green-600 text-center font-medium mt-2">
                                            Berhasil disimpan.
                                        </p>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PANEL KANAN: LIST SISWA & CETAK */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                                <div>
                                    <CardTitle>Data Siswa</CardTitle>
                                    <CardDescription>Pilih siswa untuk dicetak kartunya.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-[140px] items-center justify-between rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={selectedTingkat}
                                        onChange={(e) => handleFilterTingkat(e.target.value)}
                                    >
                                        <option value="">Semua Kelas</option>
                                        {grades.map((grade) => (
                                            <option key={grade} value={grade}>Kelas {grade}</option>
                                        ))}
                                    </select>
                                    <Button onClick={handlePrint} variant="default" className="flex gap-2">
                                        <Printer className="w-4 h-4" />
                                        Cetak {selectedStudents.length > 0 ? `(${selectedStudents.length})` : (selectedTingkat ? `Kelas ${selectedTingkat}` : 'Semua')}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2 mb-4">
                                    <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Cari nama, NIS, NISN..."
                                            className="pl-8"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </form>
                                    {search && (
                                        <Button variant="ghost" onClick={() => { setSearch(''); handleFilterTingkat(selectedTingkat); }}>Clear</Button>
                                    )}
                                </div>

                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12 text-center">
                                                    <Checkbox
                                                        checked={students.data.length > 0 && selectedStudents.length === students.data.length}
                                                        onCheckedChange={handleSelectAll}
                                                        aria-label="Select all"
                                                    />
                                                </TableHead>
                                                <TableHead>Nama Lengkap</TableHead>
                                                <TableHead>NIS / NISN</TableHead>
                                                <TableHead>Kelas</TableHead>
                                                <TableHead>Foto</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.data.length > 0 ? (
                                                students.data.map((student) => (
                                                    <TableRow key={student.id}>
                                                        <TableCell className="text-center">
                                                            <Checkbox
                                                                checked={selectedStudents.includes(student.id)}
                                                                onCheckedChange={(checked) => handleSelectStudent(checked, student.id)}
                                                                aria-label={`Select ${student.name}`}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{student.name}</TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">{student.nis}</div>
                                                            <div className="text-xs text-muted-foreground">{student.nisn || '-'}</div>
                                                        </TableCell>
                                                        <TableCell>{student.kelas}</TableCell>
                                                        <TableCell>
                                                            {student.photo_url ? (
                                                                <img src={student.photo_url} alt={student.name} className="w-8 h-10 object-cover rounded" />
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">Kosong</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center">
                                                        Belum ada data siswa.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
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
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
