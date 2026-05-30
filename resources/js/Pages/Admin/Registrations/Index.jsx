import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Download, Search, Filter, Eye } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

const STATUS = {
    draft: { label: 'Draft', variant: 'warning' },
    submitted: { label: 'Terkirim', variant: 'default' },
    verified: { label: 'Terverifikasi', variant: 'secondary' },
    accepted: { label: 'Diterima', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
    need_revision: { label: 'Perlu Revisi', variant: 'warning' },
};

export default function Index({ registrations, filters, periods }) {
    const [form, setForm] = useState({
        q: filters?.q ?? '',
        status: filters?.status ?? '',
        period_id: filters?.period_id ?? '',
        gender: filters?.gender ?? '',
        dusun: filters?.dusun ?? '',
    });

    const apply = (e) => {
        e?.preventDefault?.();
        const params = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== '' && v !== null));
        router.get(route('admin.registrations.index'), params, { preserveState: true, replace: true });
    };

    const reset = () => {
        setForm({ q: '', status: '', period_id: '', gender: '', dusun: '' });
        router.get(route('admin.registrations.index'));
    };

    const exportUrl = () => {
        const params = new URLSearchParams(
            Object.entries(form).filter(([, v]) => v !== '' && v !== null),
        ).toString();
        return route('admin.registrations.export') + (params ? '?' + params : '');
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Admin</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Daftar Pendaftar</h1>
                    </div>
                    <Button asChild variant="outline">
                        <a href={exportUrl()}>
                            <Download className="h-4 w-4" />
                            Export Excel
                        </a>
                    </Button>
                </div>
            }
        >
            <Head title="Admin - Pendaftar" />

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Filter className="h-4 w-4" />
                        Filter
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={apply} className="grid gap-3 md:grid-cols-5">
                        <Input
                            placeholder="Cari nama / NIK / no pendaftaran"
                            value={form.q}
                            onChange={(e) => setForm({ ...form, q: e.target.value })}
                            className="md:col-span-2"
                        />
                        <Select
                            value={form.status || 'all'}
                            onValueChange={(v) => setForm({ ...form, status: v === 'all' ? '' : v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                {Object.entries(STATUS).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={form.period_id || 'all'}
                            onValueChange={(v) => setForm({ ...form, period_id: v === 'all' ? '' : v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Periode</SelectItem>
                                {periods.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.academic_year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={form.gender || 'all'}
                            onValueChange={(v) => setForm({ ...form, gender: v === 'all' ? '' : v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Jenis Kelamin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="L">Laki-Laki</SelectItem>
                                <SelectItem value="P">Perempuan</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Dusun"
                            value={form.dusun}
                            onChange={(e) => setForm({ ...form, dusun: e.target.value })}
                        />
                        <div className="flex gap-2 md:col-span-5 md:justify-end">
                            <Button type="button" variant="ghost" onClick={reset}>Reset</Button>
                            <Button type="submit">
                                <Search className="h-4 w-4" />
                                Terapkan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No Pendaftaran</TableHead>
                                <TableHead>Nama Murid</TableHead>
                                <TableHead>Pendaftar</TableHead>
                                <TableHead>JK</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submit</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-navy-500">
                                        Tidak ada data.
                                    </TableCell>
                                </TableRow>
                            )}
                            {registrations.data.map((r) => {
                                const meta = STATUS[r.status] ?? STATUS.draft;
                                return (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono text-xs">{r.registration_number ?? '-'}</TableCell>
                                        <TableCell>{r.identity?.full_name ?? '-'}</TableCell>
                                        <TableCell className="text-xs text-navy-600">
                                            {r.user?.name}
                                            <br />
                                            <span className="text-navy-400">{r.user?.phone}</span>
                                        </TableCell>
                                        <TableCell>{r.identity?.gender === 'L' ? 'Laki-Laki' : r.identity?.gender === 'P' ? 'Perempuan' : '-'}</TableCell>
                                        <TableCell><Badge variant={meta.variant}>{meta.label}</Badge></TableCell>
                                        <TableCell className="text-xs text-navy-600">
                                            {r.submitted_at ? new Date(r.submitted_at).toLocaleString('id-ID') : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={route('admin.registrations.show', { registration: r.id })}>
                                                    <Eye className="h-4 w-4" />
                                                    Detail
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {registrations.links?.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {registrations.links.map((link, idx) => (
                        <Link
                            key={idx}
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
