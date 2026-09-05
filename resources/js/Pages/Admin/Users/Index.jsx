import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Shield, User as UserIcon } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent } from '@/Components/ui/card';
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

export default function Index({ users, filters }) {
    const [form, setForm] = useState({
        q: filters?.q ?? '',
        role: filters?.role ?? '',
    });

    const apply = (e) => {
        e?.preventDefault?.();
        const params = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== '' && v !== null));
        router.get(route('admin.users.index'), params, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Pengguna</h1>
                </div>
            }
        >
            <Head title="Admin - Pengguna" />

            <Card className="mb-4">
                <CardContent className="py-4">
                    <form onSubmit={apply} className="grid gap-3 md:grid-cols-4">
                        <Input
                            placeholder="Cari nama / no HP"
                            value={form.q}
                            onChange={(e) => setForm({ ...form, q: e.target.value })}
                            className="md:col-span-2"
                        />
                        <Select
                            value={form.role || 'all'}
                            onValueChange={(v) => setForm({ ...form, role: v === 'all' ? '' : v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit">
                            <Search className="h-4 w-4" />
                            Cari
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <p className="px-4 pt-3 text-xs text-navy-500 sm:hidden">
                        Geser tabel ke samping untuk melihat semua kolom.
                    </p>
                    <Table className="min-w-[680px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">Nama</TableHead>
                                <TableHead className="whitespace-nowrap">Nomor HP</TableHead>
                                <TableHead className="whitespace-nowrap">Role</TableHead>
                                <TableHead className="whitespace-nowrap">Verifikasi</TableHead>
                                <TableHead className="whitespace-nowrap">Bergabung</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-10 text-center text-sm text-navy-500">
                                        Tidak ada user.
                                    </TableCell>
                                </TableRow>
                            )}
                            {users.data.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell className="min-w-[160px] font-medium">{u.name}</TableCell>
                                    <TableCell className="whitespace-nowrap font-mono text-sm">{u.phone}</TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {u.role === 'admin' ? (
                                            <Badge variant="default">
                                                <Shield className="mr-1 h-3 w-3" />
                                                Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                <UserIcon className="mr-1 h-3 w-3" />
                                                User
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {u.phone_verified_at ? (
                                            <Badge variant="success">Terverifikasi</Badge>
                                        ) : (
                                            <Badge variant="warning">Belum</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap text-xs text-navy-600">
                                        {new Date(u.created_at).toLocaleDateString('id-ID')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {users.links?.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
                    {users.links.map((link, idx) => (
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
