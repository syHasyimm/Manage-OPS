import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Loader2,
    Upload,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { toast } from 'sonner';

function FieldError({ message }) {
    if (!message) return null;

    return <p className="text-xs text-red-600">{message}</p>;
}

export default function Import({ result }) {
    const fileInputRef = useRef(null);
    const form = useForm({ file: null });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.students.import.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData('file', null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: () => toast.error('File belum dapat diimpor. Periksa format dan isinya.'),
        });
    };

    const isFailed = result?.status === 'failed';

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Import Data Siswa</h1>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route('admin.students.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Import Data Siswa" />

            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileSpreadsheet className="h-4 w-4" />
                            Unggah File Excel
                        </CardTitle>
                        <CardDescription>
                            Gunakan template agar nama kolom dan format data terbaca dengan benar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/50 p-5">
                                <Input
                                    ref={fileInputRef}
                                    id="file"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)}
                                    className="h-auto py-2"
                                    required
                                />
                                <p className="mt-2 text-xs text-navy-500">Format XLSX, XLS, atau CSV. Ukuran maksimal 5 MB.</p>
                                <FieldError message={form.errors.file} />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    Mulai Import
                                </Button>
                                <Button asChild type="button" variant="outline">
                                    <a href={route('admin.students.template')}>
                                        <Download className="h-4 w-4" />
                                        Unduh Template
                                    </a>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Format Kolom</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-navy-700">
                        <p>Kolom wajib: <strong>Nama, NIS, NISN, NIK, Tempat Lahir, Tanggal Lahir, Agama, Alamat, No Ortu, Nama Ortu, Kelas</strong>.</p>
                        <p>NISN dan NIK harus disimpan sebagai teks di Excel agar angka nol di depan tidak hilang.</p>
                        <p>Kelas ditulis seperti <code className="rounded bg-navy-50 px-1">1</code> atau <code className="rounded bg-navy-50 px-1">1A</code>. Foto ditambahkan melalui form Edit setelah import.</p>
                        <p>Jika ada baris tidak valid, seluruh file dibatalkan. Baris duplikat dilewati dan dilaporkan.</p>
                    </CardContent>
                </Card>

                {result && (
                    <Card className={isFailed ? 'border-red-200' : 'border-emerald-200'}>
                        <CardHeader>
                            <CardTitle className={`flex items-center gap-2 text-base ${isFailed ? 'text-red-800' : 'text-emerald-800'}`}>
                                {isFailed ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                Hasil Import
                            </CardTitle>
                            <CardDescription>{result.message}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-lg bg-emerald-50 p-3">
                                    <p className="text-xs text-emerald-700">Berhasil disimpan</p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-900">{result.imported ?? 0}</p>
                                </div>
                                <div className="rounded-lg bg-amber-50 p-3">
                                    <p className="text-xs text-amber-700">Duplikat dilewati</p>
                                    <p className="mt-1 text-2xl font-semibold text-amber-900">{result.duplicate_rows?.length ?? 0}</p>
                                </div>
                                <div className="rounded-lg bg-red-50 p-3">
                                    <p className="text-xs text-red-700">Baris invalid</p>
                                    <p className="mt-1 text-2xl font-semibold text-red-900">{result.invalid_rows?.length ?? 0}</p>
                                </div>
                            </div>

                            {result.invalid_rows?.length > 0 && (
                                <div className="overflow-x-auto rounded-lg border border-red-100">
                                    <Table className="min-w-[560px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Baris</TableHead>
                                                <TableHead>Alasan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result.invalid_rows.map((row) => (
                                                <TableRow key={row.row}>
                                                    <TableCell>{row.row}</TableCell>
                                                    <TableCell className="text-red-700">{row.errors.join(' ')}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            {result.duplicate_rows?.length > 0 && (
                                <div className="overflow-x-auto rounded-lg border border-amber-100">
                                    <Table className="min-w-[560px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Baris</TableHead>
                                                <TableHead>Alasan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result.duplicate_rows.map((row) => (
                                                <TableRow key={row.row}>
                                                    <TableCell>{row.row}</TableCell>
                                                    <TableCell className="text-amber-800">{row.reason}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
