import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Heart, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';

function ValueModal({ value, onClose }) {
    const isEdit = !!value;

    const { data, setData, post, patch, processing, errors } = useForm({
        title:       value?.title       ?? '',
        description: value?.description ?? '',
        icon:        value?.icon        ?? '',
        sort_order:  value?.sort_order  ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => { toast.success(isEdit ? 'Nilai Karakter diperbarui.' : 'Nilai Karakter ditambahkan.'); onClose(); },
            onError:   () => toast.error('Periksa kembali isian.'),
        };
        if (isEdit) {
            patch(route('admin.school-values.update', value.id), opts);
        } else {
            post(route('admin.school-values.store'), opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-navy-950/40" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
                <div className="border-b border-navy-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-navy-950">{isEdit ? 'Edit Nilai Karakter' : 'Tambah Nilai Karakter'}</h2>
                </div>
                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Judul <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Religius"
                        />
                        {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Deskripsi <span className="text-red-500">*</span></Label>
                        <textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Tuliskan deskripsi nilai karakter..."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="icon">Nama Icon (Lucide)</Label>
                            <Input
                                id="icon"
                                value={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                placeholder="Contoh: Heart"
                            />
                            {errors.icon && <p className="text-xs text-red-600">{errors.icon}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="sort_order">Urutan</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min="0"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Index({ values }) {
    const [modal, setModal] = useState(null);

    const handleDelete = (value) => {
        if (!confirm(`Hapus nilai karakter "${value.title}"?`)) return;
        router.delete(route('admin.school-values.destroy', value.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Nilai Karakter dihapus.'),
            onError:   () => toast.error('Gagal menghapus nilai karakter.'),
        });
    };

    const renderIcon = (iconName) => {
        if (!iconName) return <Heart className="h-5 w-5 text-navy-400" />;
        const IconComponent = LucideIcons[iconName];
        return IconComponent ? <IconComponent className="h-5 w-5 text-gold-500" /> : <Heart className="h-5 w-5 text-navy-400" />;
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Landing Page</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Nilai Karakter</h1>
                </div>
            }
        >
            <Head title="Nilai Karakter" />

            {modal && (
                <ValueModal
                    value={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Heart className="h-4 w-4" />
                        Daftar Nilai Karakter ({values.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setModal('create')}>
                        <Plus className="h-4 w-4" />
                        Tambah Nilai
                    </Button>
                </CardHeader>
                <CardContent>
                    {values.length === 0 ? (
                        <div className="py-12 text-center text-sm text-navy-500">
                            Belum ada nilai karakter. Klik "Tambah Nilai" untuk menambahkan.
                        </div>
                    ) : (
                        <div className="divide-y divide-navy-100">
                            {values.map((value, idx) => (
                                <div key={value.id} className="flex items-start justify-between gap-4 py-4">
                                    <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-navy-50">
                                        {renderIcon(value.icon)}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="text-sm font-semibold text-navy-900">{value.title}</p>
                                        <p className="text-xs text-navy-600 leading-relaxed">{value.description}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setModal(value)}
                                            aria-label="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(value)}
                                            className="text-red-600 hover:text-red-700"
                                            aria-label="Hapus"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
