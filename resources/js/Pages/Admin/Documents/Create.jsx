import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { ArrowLeft, Loader2, Save, FilePlus } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
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
    return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export default function Create({ categories, statuses }) {
    const fileInputRef = useRef(null);
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category: '',
        academic_year: '',
        tags: '',
        status: 'Aktif',
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.documents.store'), {
            forceFormData: true,
            preserveScroll: true,
            onError: () => toast.error('Gagal mengunggah dokumen. Silakan periksa isian form.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Upload Dokumen Baru</h1>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route('admin.documents.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Upload Dokumen Baru" />

            <div className="mx-auto max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FilePlus className="h-4 w-4" />
                            Detail Dokumen
                        </CardTitle>
                        <CardDescription>
                            Lengkapi informasi di bawah untuk mempermudah pencarian dokumen nantinya.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="title" className={errors.title ? 'text-red-600' : ''}>
                                        Judul Dokumen <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Misal: Surat Edaran Libur Semester Ganjil"
                                        required
                                    />
                                    <FieldError message={errors.title} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category" className={errors.category ? 'text-red-600' : ''}>Kategori</Label>
                                    <Select
                                        value={data.category}
                                        onValueChange={(value) => setData('category', value)}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={errors.category} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="academic_year" className={errors.academic_year ? 'text-red-600' : ''}>Tahun Ajaran</Label>
                                    <Input
                                        id="academic_year"
                                        value={data.academic_year}
                                        onChange={(e) => setData('academic_year', e.target.value)}
                                        placeholder="Misal: 2025/2026"
                                    />
                                    <FieldError message={errors.academic_year} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="tags" className={errors.tags ? 'text-red-600' : ''}>Tags / Kata Kunci</Label>
                                    <Input
                                        id="tags"
                                        value={data.tags}
                                        onChange={(e) => setData('tags', e.target.value)}
                                        placeholder="Pisahkan dengan koma. Misal: ujian, penting, semester 1"
                                    />
                                    <p className="text-[11px] text-navy-500">Membantu mempercepat pencarian. Pisahkan dengan tanda koma (,).</p>
                                    <FieldError message={errors.tags} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="status" className={errors.status ? 'text-red-600' : ''}>Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) => setData('status', value)}
                                    >
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((stat) => (
                                                <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={errors.status} />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="file" className={errors.file ? 'text-red-600' : ''}>
                                        File Dokumen <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/50 p-5">
                                        <Input
                                            ref={fileInputRef}
                                            id="file"
                                            type="file"
                                            onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                                            className="h-auto py-2"
                                            required
                                        />
                                        <p className="mt-2 text-xs text-navy-500">
                                            Format didukung: PDF, DOCX, XLSX, PPTX, JPG, PNG. Maksimal 10 MB.
                                        </p>
                                    </div>
                                    <FieldError message={errors.file} />
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-navy-100 pt-6">
                                <Button type="submit" disabled={processing}>
                                    {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan Dokumen
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
