import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Award, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { toast } from 'sonner';

function AchievementModal({ achievement, onClose }) {
    const isEdit = !!achievement;

    const { data, setData, post, patch, processing, errors } = useForm({
        title:       achievement?.title       ?? '',
        year:        achievement?.year        ?? new Date().getFullYear(),
        level:       achievement?.level       ?? '',
        category:    achievement?.category    ?? '',
        is_active:   achievement?.is_active   ?? true,
        sort_order:  achievement?.sort_order  ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => { toast.success(isEdit ? 'Prestasi diperbarui.' : 'Prestasi ditambahkan.'); onClose(); },
            onError:   () => toast.error('Periksa kembali isian.'),
        };
        if (isEdit) {
            patch(route('admin.achievements.update', achievement.id), opts);
        } else {
            post(route('admin.achievements.store'), opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-navy-950/40" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
                <div className="border-b border-navy-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-navy-950">{isEdit ? 'Edit Prestasi' : 'Tambah Prestasi'}</h2>
                </div>
                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Nama Prestasi/Penghargaan <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Contoh: Juara 1 Lomba Cerdas Cermat"
                        />
                        {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="year">Tahun <span className="text-red-500">*</span></Label>
                            <Input
                                id="year"
                                type="number"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                            />
                            {errors.year && <p className="text-xs text-red-600">{errors.year}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="level">Tingkat</Label>
                            <Input
                                id="level"
                                value={data.level}
                                onChange={(e) => setData('level', e.target.value)}
                                placeholder="Contoh: Kabupaten, Provinsi"
                            />
                            {errors.level && <p className="text-xs text-red-600">{errors.level}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="category">Kategori/Bidang (Opsional)</Label>
                        <Input
                            id="category"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            placeholder="Contoh: Akademik, Olahraga"
                        />
                        {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-navy-300 text-gold-600"
                                />
                                <label htmlFor="is_active" className="text-sm text-navy-700">Aktif</label>
                            </div>
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

export default function Index({ achievements }) {
    const [modal, setModal] = useState(null);

    const handleDelete = (achievement) => {
        if (!confirm(`Hapus prestasi "${achievement.title}"?`)) return;
        router.delete(route('admin.achievements.destroy', achievement.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Prestasi dihapus.'),
            onError:   () => toast.error('Gagal menghapus prestasi.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Landing Page</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Prestasi Sekolah</h1>
                </div>
            }
        >
            <Head title="Prestasi Sekolah" />

            {modal && (
                <AchievementModal
                    achievement={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Award className="h-4 w-4" />
                        Daftar Prestasi ({achievements.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setModal('create')}>
                        <Plus className="h-4 w-4" />
                        Tambah Prestasi
                    </Button>
                </CardHeader>
                <CardContent>
                    {achievements.length === 0 ? (
                        <div className="py-12 text-center text-sm text-navy-500">
                            Belum ada prestasi. Klik "Tambah Prestasi" untuk menambahkan.
                        </div>
                    ) : (
                        <div className="divide-y divide-navy-100">
                            {achievements.map((achievement) => (
                                <div key={achievement.id} className="flex items-start justify-between gap-4 py-4">
                                    <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-lg bg-gold-50 border border-gold-100 text-gold-600 font-bold text-lg">
                                        {achievement.year}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1 py-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-navy-900">{achievement.title}</p>
                                            {!achievement.is_active && (
                                                <Badge variant="secondary" className="text-[10px]">Nonaktif</Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {achievement.level && (
                                                <Badge variant="outline" className="text-[10px] text-navy-600 border-navy-200 bg-white">
                                                    Tingkat {achievement.level}
                                                </Badge>
                                            )}
                                            {achievement.category && (
                                                <Badge variant="outline" className="text-[10px] text-navy-600 border-navy-200 bg-white">
                                                    {achievement.category}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setModal(achievement)}
                                            aria-label="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(achievement)}
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
