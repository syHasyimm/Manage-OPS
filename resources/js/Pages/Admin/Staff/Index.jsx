import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Edit3,
    FileSpreadsheet,
    Plus,
    Search,
    Trash2,
    Download,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
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

export default function Index({ staff, filters }) {
    const [form, setForm] = useState({
        q: filters?.q ?? '',
        jenis: filters?.jenis ?? '',
    });

    const [isExportOpen, setIsExportOpen] = useState(false);
    const availableColumns = [
        { id: 'name', label: 'Nama Lengkap' },
        { id: 'nip', label: 'NIP' },
        { id: 'nuptk', label: 'NUPTK' },
        { id: 'nik', label: 'NIK' },
        { id: 'birth_info', label: 'Tempat, Tanggal Lahir' },
        { id: 'jabatan', label: 'Jabatan' },
        { id: 'pangkat', label: 'Pangkat' },
        { id: 'golongan', label: 'Golongan' },
        { id: 'jenis', label: 'Jenis' },
    ];
    const [selectedColumns, setSelectedColumns] = useState(availableColumns.map(c => c.id));

    const toggleColumn = (id) => {
        setSelectedColumns(prev => 
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (form.q) params.append('q', form.q);
        if (form.jenis) params.append('jenis', form.jenis);
        params.append('columns', selectedColumns.join(','));
        
        window.location.href = route('admin.staff.export') + '?' + params.toString();
        setIsExportOpen(false);
    };

    const apply = (event) => {
        event?.preventDefault?.();
        const params = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== '' && value !== null));
        router.get(route('admin.staff.index'), params, { preserveState: true, replace: true });
    };

    const reset = () => {
        setForm({ q: '', jenis: '' });
        router.get(route('admin.staff.index'));
    };

    const remove = (item) => {
        if (! window.confirm(`Hapus data ${item.name}?`)) return;

        router.delete(route('admin.staff.destroy', { staff: item.id }), { preserveScroll: true });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Manage SDM</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Data Guru & Tendik</h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('admin.staff.import.create')}>
                                <FileSpreadsheet className="h-4 w-4" />
                                Import Excel
                            </Link>
                        </Button>
                        <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Download className="h-4 w-4" />
                                    Export Excel
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Export Data Guru/Tendik</DialogTitle>
                                    <DialogDescription>
                                        Pilih kolom yang ingin disertakan dalam file Excel.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    {availableColumns.map((col) => (
                                        <div key={col.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`col-${col.id}`}
                                                checked={selectedColumns.includes(col.id)}
                                                onCheckedChange={() => toggleColumn(col.id)}
                                            />
                                            <Label htmlFor={`col-${col.id}`}>{col.label}</Label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsExportOpen(false)}>Batal</Button>
                                    <Button onClick={handleExport} disabled={selectedColumns.length === 0}>
                                        Export Sekarang
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button asChild>
                            <Link href={route('admin.staff.create')}>
                                <Plus className="h-4 w-4" />
                                Tambah Manual
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Admin - Data Guru & Tendik" />

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Search className="h-4 w-4" />
                        Cari Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={apply} className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]">
                        <Input
                            placeholder="Nama / NIP / NIK"
                            value={form.q}
                            onChange={(event) => setForm({ ...form, q: event.target.value })}
                        />
                        <Select
                            value={form.jenis || 'all'}
                            onValueChange={(value) => setForm({ ...form, jenis: value === 'all' ? '' : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Semua jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua jenis</SelectItem>
                                <SelectItem value="guru">Guru</SelectItem>
                                <SelectItem value="tendik">Tendik</SelectItem>
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
                    <Table className="min-w-[1000px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>NIP / NUPTK</TableHead>
                                <TableHead>NIK</TableHead>
                                <TableHead>Jabatan</TableHead>
                                <TableHead>Pangkat/Golongan</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-sm text-navy-500">
                                        Belum ada data guru/tendik.
                                    </TableCell>
                                </TableRow>
                            )}
                            {staff.data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium text-navy-900">{item.name}</div>
                                        <div className="text-xs text-navy-500">
                                            {item.birth_place}, {new Date(item.birth_date).toLocaleDateString('id-ID')}
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-xs text-navy-700">
                                        <div>NIP: {item.nip || '-'}</div>
                                        <div className="text-navy-500">NUPTK: {item.nuptk || '-'}</div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap font-mono text-xs">{item.nik}</TableCell>
                                    <TableCell className="whitespace-nowrap text-sm">{item.jabatan}</TableCell>
                                    <TableCell className="whitespace-nowrap text-xs">
                                        <div>{item.pangkat || '-'}</div>
                                        <div className="text-navy-500">{item.golongan || '-'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.jenis === 'guru' ? 'default' : 'secondary'} className="capitalize">
                                            {item.jenis}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={route('admin.staff.edit', { staff: item.id })}>
                                                <Edit3 className="h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => remove(item)}
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

            {staff.links?.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {staff.links.map((link, index) => (
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
