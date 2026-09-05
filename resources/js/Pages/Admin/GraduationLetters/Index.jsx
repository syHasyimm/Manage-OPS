import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Award,
    Download,
    Eye,
    Loader2,
    Lock,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center gap-1 pt-4">
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || '#'}
                    preserveScroll
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        link.active
                            ? 'bg-navy-900 text-white'
                            : link.url
                              ? 'text-navy-600 hover:bg-navy-100'
                              : 'cursor-not-allowed text-navy-300'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}

export default function Index({ letters, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteTarget, setDeleteTarget] = useState(null);

    const handleSearch = useCallback(
        (e) => {
            e.preventDefault();
            router.get(route('admin.graduation-letters.index'), { search }, { preserveState: true });
        },
        [search],
    );

    const handleFinalize = (id) => {
        if (!confirm('Finalkan SKL ini? Surat yang sudah final tidak bisa dihapus.')) return;

        router.post(route('admin.graduation-letters.finalize', id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('SKL berhasil difinalkan.'),
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;

        router.delete(route('admin.graduation-letters.destroy', deleteTarget), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('SKL berhasil dihapus.');
                setDeleteTarget(null);
            },
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Admin</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Surat Keterangan Kelulusan</h1>
                        <p className="mt-1 text-xs text-navy-500">
                            Kelola dan cetak SKL siswa.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('admin.graduation-letters.import.create')}>
                            <Button variant="outline">
                                Import Excel
                            </Button>
                        </Link>
                        <Link href={route('admin.graduation-letters.create')}>
                            <Button>
                                <Plus className="h-4 w-4" />
                                Buat SKL
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Surat Keterangan Kelulusan" />

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Award className="h-4 w-4" />
                            Daftar SKL
                        </CardTitle>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama, NIS, NISN, nomor surat..."
                                    className="w-64 pl-9"
                                />
                            </div>
                            <Button type="submit" variant="outline" size="sm">
                                Cari
                            </Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent>
                    {letters.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Award className="mb-3 h-10 w-10 text-navy-300" />
                            <p className="text-sm font-medium text-navy-600">Belum ada SKL</p>
                            <p className="mt-1 text-xs text-navy-400">Klik tombol &quot;Buat SKL&quot; untuk mulai.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg border border-navy-100">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>Siswa</TableHead>
                                            <TableHead>NIS / NISN</TableHead>
                                            <TableHead>No. Surat</TableHead>
                                            <TableHead className="text-center">Rata-rata</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-center">Dokumen</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {letters.data.map((letter, i) => (
                                            <TableRow key={letter.id}>
                                                <TableCell className="text-navy-400">
                                                    {(letters.current_page - 1) * letters.per_page + i + 1}
                                                </TableCell>
                                                <TableCell className="font-medium text-navy-900">
                                                    {letter.student?.name ?? '-'}
                                                    {letter.student?.kelas && (
                                                        <span className="ml-1.5 text-xs text-navy-400">({letter.student.kelas})</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-navy-500">
                                                    {letter.student?.nis ?? '-'} / {letter.student?.nisn ?? '-'}
                                                </TableCell>
                                                <TableCell className="text-sm">{letter.letter_number}</TableCell>
                                                <TableCell className="text-center font-semibold">{letter.average_score}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={letter.graduation_status === 'LULUS' ? 'default' : 'destructive'}>
                                                        {letter.graduation_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={letter.document_status === 'final' ? 'default' : 'outline'}>
                                                        {letter.document_status === 'final' ? 'Final' : 'Draft'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <a
                                                            href={route('admin.graduation-letters.download', letter.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button variant="ghost" size="sm" title="Unduh PDF">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </a>
                                                        {letter.document_status !== 'final' && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    title="Finalkan"
                                                                    onClick={() => handleFinalize(letter.id)}
                                                                >
                                                                    <Lock className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    title="Hapus"
                                                                    className="text-red-600 hover:text-red-700"
                                                                    onClick={() => setDeleteTarget(letter.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <Pagination links={letters.links} />
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus SKL</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus SKL ini? Tindakan ini tidak bisa dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
