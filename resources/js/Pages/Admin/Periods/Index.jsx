import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, CheckCircle2, Loader2, Plus, Power, PowerOff } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

export default function Index({ periods }) {
    const create = useForm({
        academic_year: '',
        opens_at: '',
        closes_at: '',
        is_active: false,
    });

    const submit = (e) => {
        e.preventDefault();
        create.post(route('admin.periods.store'), {
            preserveScroll: true,
            onSuccess: () => create.reset(),
        });
    };

    const activate = (id) => {
        router.post(route('admin.periods.activate', { period: id }), {}, { preserveScroll: true });
    };

    const deactivate = (id) => {
        router.post(route('admin.periods.deactivate', { period: id }), {}, { preserveScroll: true });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Periode Pendaftaran</h1>
                </div>
            }
        >
            <Head title="Admin - Periode" />

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Plus className="h-4 w-4" />
                            Tambah Periode
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="academic_year">Tahun Ajaran</Label>
                                <Input
                                    id="academic_year"
                                    placeholder="2027/2028"
                                    value={create.data.academic_year}
                                    onChange={(e) => create.setData('academic_year', e.target.value)}
                                />
                                {create.errors.academic_year && <p className="text-xs text-red-600">{create.errors.academic_year}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="opens_at">Buka</Label>
                                <Input
                                    id="opens_at"
                                    type="datetime-local"
                                    value={create.data.opens_at}
                                    onChange={(e) => create.setData('opens_at', e.target.value)}
                                />
                                {create.errors.opens_at && <p className="text-xs text-red-600">{create.errors.opens_at}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="closes_at">Tutup</Label>
                                <Input
                                    id="closes_at"
                                    type="datetime-local"
                                    value={create.data.closes_at}
                                    onChange={(e) => create.setData('closes_at', e.target.value)}
                                />
                                {create.errors.closes_at && <p className="text-xs text-red-600">{create.errors.closes_at}</p>}
                            </div>
                            <label className="flex items-center justify-between text-sm text-navy-800">
                                Set sebagai aktif
                                <Switch
                                    checked={create.data.is_active}
                                    onCheckedChange={(v) => create.setData('is_active', Boolean(v))}
                                />
                            </label>
                            <Button type="submit" className="w-full" disabled={create.processing}>
                                {create.processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                Simpan Periode
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Daftar Periode</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <p className="px-4 pt-3 text-xs text-navy-500 sm:hidden">
                            Geser tabel ke samping untuk melihat semua kolom.
                        </p>
                        <Table className="min-w-[680px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Tahun Ajaran</TableHead>
                                    <TableHead className="whitespace-nowrap">Buka</TableHead>
                                    <TableHead className="whitespace-nowrap">Tutup</TableHead>
                                    <TableHead className="whitespace-nowrap">Status</TableHead>
                                    <TableHead className="whitespace-nowrap text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {periods.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-10 text-center text-sm text-navy-500">
                                            Belum ada periode.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {periods.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="whitespace-nowrap font-medium">
                                            <Calendar className="mr-2 inline h-4 w-4 text-gold-600" />
                                            {p.academic_year}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-xs text-navy-600">
                                            {new Date(p.opens_at).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-xs text-navy-600">
                                            {new Date(p.closes_at).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {p.is_active ? (
                                                <Badge variant="success">
                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                    Aktif
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Nonaktif</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-right">
                                            {p.is_active ? (
                                                <Button size="sm" variant="outline" onClick={() => deactivate(p.id)}>
                                                    <PowerOff className="h-3.5 w-3.5" />
                                                    Nonaktifkan
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={() => activate(p.id)}>
                                                    <Power className="h-3.5 w-3.5" />
                                                    Aktifkan
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
