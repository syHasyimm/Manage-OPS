import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Bell,
    ChevronRight,
    Plus,
    RefreshCw,
    Search,
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

const statusVariants = {
    pending: { label: 'Menunggu', variant: 'warning' },
    terkirim: { label: 'Terkirim', variant: 'success' },
    gagal: { label: 'Gagal', variant: 'destructive' },
};

export default function Index({ notifications, filters, categories, statuses }) {
    const [form, setForm] = useState({
        q: filters?.q ?? '',
        category: filters?.category ?? '',
        status: filters?.status ?? '',
    });

    const apply = (event) => {
        event?.preventDefault?.();
        const params = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== '' && value !== null));
        router.get(route('admin.notifications.index'), params, { preserveState: true, replace: true });
    };

    const reset = () => {
        setForm({ q: '', category: '', status: '' });
        router.get(route('admin.notifications.index'));
    };

    const retry = (notification) => {
        router.post(route('admin.notifications.retry', { studentNotification: notification.id }), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Notifikasi dijadwalkan untuk dikirim ulang.'),
            onError: () => toast.error('Notifikasi gagal dijadwalkan ulang.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Administrasi</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Notifikasi Orang Tua</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('admin.notification-templates.index')}>Template Pesan</Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.notifications.create')}>
                                <Plus className="h-4 w-4" />
                                Buat Notifikasi
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Notifikasi Orang Tua" />

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Search className="h-4 w-4" />
                        Filter Riwayat
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={apply} className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto_auto]">
                        <Input
                            placeholder="Cari nama siswa / NIS / nomor tujuan"
                            value={form.q}
                            onChange={(event) => setForm({ ...form, q: event.target.value })}
                        />
                        <Select
                            value={form.category || 'all'}
                            onValueChange={(value) => setForm({ ...form, category: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger><SelectValue placeholder="Semua kategori" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua kategori</SelectItem>
                                {Object.entries(categories).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={form.status || 'all'}
                            onValueChange={(value) => setForm({ ...form, status: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger><SelectValue placeholder="Semua status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua status</SelectItem>
                                {Object.entries(statuses).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
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
                    <p className="px-4 pt-3 text-xs text-navy-500 sm:hidden">Geser tabel ke samping untuk melihat semua kolom.</p>
                    <Table className="min-w-[1100px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Siswa</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Pesan Final</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {notifications.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-10 text-center text-sm text-navy-500">Belum ada riwayat notifikasi.</TableCell>
                                </TableRow>
                            )}
                            {notifications.data.map((notification) => {
                                const status = statusVariants[notification.status] ?? statusVariants.pending;

                                return (
                                    <TableRow key={notification.id}>
                                        <TableCell className="whitespace-nowrap text-xs text-navy-600">
                                            {notification.created_at ? new Date(notification.created_at).toLocaleString('id-ID') : '-'}
                                        </TableCell>
                                        <TableCell className="min-w-[170px]">
                                            <p className="font-medium text-navy-900">{notification.student_name}</p>
                                            <p className="text-xs text-navy-500">{notification.student_nis || '-'} · {notification.target_phone}</p>
                                            {notification.batch_id && <Badge variant="secondary" className="mt-1 text-[10px]">Broadcast</Badge>}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm">
                                            <p>{notification.category_label}</p>
                                            <p className="text-xs text-navy-500">{notification.template_name || '-'}</p>
                                        </TableCell>
                                        <TableCell className="max-w-[350px]">
                                            <p className="line-clamp-3 whitespace-pre-line text-xs leading-5 text-navy-700">{notification.final_message}</p>
                                            {notification.error && <p className="mt-1 text-xs text-red-600">{notification.error}</p>}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                            {notification.sent_at && <p className="mt-1 text-[10px] text-navy-500">{new Date(notification.sent_at).toLocaleString('id-ID')}</p>}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {notification.status === 'gagal' && (
                                                <Button type="button" size="sm" variant="outline" onClick={() => retry(notification)}>
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                    Kirim Ulang
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {notifications.links?.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {notifications.links.map((link, index) => (
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
