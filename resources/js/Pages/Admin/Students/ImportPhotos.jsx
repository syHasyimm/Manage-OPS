import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import {
    ArrowLeft,
    CheckCircle2,
    FileArchive,
    Loader2,
    Upload,
    AlertCircle,
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

export default function ImportPhotos({ result }) {
    const fileInputRef = useRef(null);
    const form = useForm({ file: null });

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.students.import-photos.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData('file', null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: () => toast.error('File belum dapat diimpor. Periksa format dan ukurannya.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Upload Foto (ZIP)</h1>
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
            <Head title="Upload Foto Massal" />

            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileArchive className="h-4 w-4" />
                            Unggah File ZIP
                        </CardTitle>
                        <CardDescription>
                            Pastikan foto-foto di dalam ZIP dinamai dengan NISN siswa (contoh: 0012345678.jpg).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/50 p-5">
                                <Input
                                    ref={fileInputRef}
                                    id="file"
                                    type="file"
                                    accept=".zip"
                                    onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)}
                                    className="h-auto py-2"
                                    required
                                />
                                <p className="mt-2 text-xs text-navy-500">Format ZIP. Ukuran maksimal 100 MB.</p>
                                <FieldError message={form.errors.file} />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button type="submit" disabled={form.processing}>
                                    {form.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    Mulai Upload
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Aturan Upload</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-navy-700">
                        <p>Format foto yang didukung: <strong>JPG, JPEG, PNG</strong>.</p>
                        <p>File lain (seperti txt, pdf) atau folder di dalam ZIP akan otomatis diabaikan.</p>
                        <p>Foto akan otomatis di-resize untuk menghemat penyimpanan. Jika siswa sudah memiliki foto, maka akan otomatis <strong>ditimpa (replace)</strong> dengan yang baru.</p>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="border-emerald-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base text-emerald-800">
                                {result.failed > 0 ? <AlertCircle className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4" />}
                                Hasil Import
                            </CardTitle>
                            <CardDescription>{result.message}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg bg-emerald-50 p-3">
                                    <p className="text-xs text-emerald-700">Berhasil diproses</p>
                                    <p className="mt-1 text-2xl font-semibold text-emerald-900">{result.imported ?? 0}</p>
                                </div>
                                <div className="rounded-lg bg-red-50 p-3">
                                    <p className="text-xs text-red-700">Gagal / Tidak Ditemukan</p>
                                    <p className="mt-1 text-2xl font-semibold text-red-900">{result.failed ?? 0}</p>
                                </div>
                            </div>

                            {result.details?.length > 0 && (
                                <div className="overflow-x-auto rounded-lg border border-navy-100 mt-4">
                                    <Table className="min-w-[560px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>NISN (Nama File)</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Keterangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result.details.map((detail, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-mono text-xs">{detail.nisn}</TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                            detail.status === 'Berhasil' 
                                                                ? 'bg-emerald-100 text-emerald-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {detail.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-xs">{detail.reason}</TableCell>
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
