import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Edit3,
    Eye,
    Download,
    FileText,
    Plus,
    Search,
    Trash2,
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
import { toast } from 'sonner';

export default function Index({ documents, filters, categories, statuses, years }) {
    const [form, setForm] = useState({
        q: filters?.q ?? '',
        category: filters?.category ?? '',
        academic_year: filters?.academic_year ?? '',
        status: filters?.status ?? '',
    });

    const apply = (event) => {
        event?.preventDefault?.();
        const params = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== '' && value !== null));
        router.get(route('admin.documents.index'), params, { preserveState: true, replace: true });
    };

    const reset = () => {
        setForm({ q: '', category: '', academic_year: '', status: '' });
        router.get(route('admin.documents.index'));
    };

    const remove = (document) => {
        if (! window.confirm(`Hapus dokumen ${document.title}?`)) return;

        router.delete(route('admin.documents.destroy', { document: document.id }), { preserveScroll: true });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Manajemen Dokumen</h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href={route('admin.documents.create')}>
                                <Plus className="h-4 w-4" />
                                Upload Dokumen
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Manajemen Dokumen" />

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Search className="h-4 w-4" />
                        Cari & Filter Dokumen
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={apply} className="grid gap-3 md:grid-cols-[1fr_150px_150px_150px_auto_auto]">
                        <Input
                            placeholder="Cari judul, nama file, atau tag..."
                            value={form.q}
                            onChange={(event) => setForm({ ...form, q: event.target.value })}
                        />
                        <Select
                            value={form.category || 'all'}
                            onValueChange={(value) => setForm({ ...form, category: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={form.academic_year || 'all'}
                            onValueChange={(value) => setForm({ ...form, academic_year: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tahun</SelectItem>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={form.status || 'all'}
                            onValueChange={(value) => setForm({ ...form, status: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                {statuses.map((stat) => (
                                    <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
                        <Button type="submit">Filter</Button>
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
                                <TableHead>Judul Dokumen</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Tahun Ajaran</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead>Ukuran</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Diunggah Oleh</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center text-sm text-navy-500">
                                        Belum ada dokumen yang diunggah.
                                    </TableCell>
                                </TableRow>
                            )}
                            {documents.data.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-400">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-navy-900 line-clamp-1">{doc.title}</p>
                                                <p className="text-xs text-navy-500 line-clamp-1">{doc.file_name}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">{doc.category || '-'}</TableCell>
                                    <TableCell className="whitespace-nowrap">{doc.academic_year || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {doc.tags && doc.tags.map((tag, i) => (
                                                <Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-xs">{doc.file_size_mb}</TableCell>
                                    <TableCell>
                                        <Badge variant={doc.status === 'Aktif' ? 'default' : 'secondary'}>
                                            {doc.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-xs text-navy-500">{doc.uploader_name}</TableCell>
                                    <TableCell className="whitespace-nowrap text-right">
                                        {['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'text/plain'].includes(doc.mime_type) && (
                                            <Button asChild variant="ghost" size="sm" title="Preview Dokumen">
                                                <a href={route('admin.documents.preview', { document: doc.id })} target="_blank" rel="noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        <Button asChild variant="ghost" size="sm">
                                            <a href={route('admin.documents.download', { document: doc.id })}>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={route('admin.documents.edit', { document: doc.id })}>
                                                <Edit3 className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(doc)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {documents.links?.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {documents.links.map((link, index) => (
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
