import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Target, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { toast } from 'sonner';

function MissionModal({ mission, onClose }) {
    const isEdit = !!mission;

    const { data, setData, post, patch, processing, errors } = useForm({
        body:       mission?.body       ?? '',
        sort_order: mission?.sort_order ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => { toast.success(isEdit ? 'Misi diperbarui.' : 'Misi ditambahkan.'); onClose(); },
            onError:   () => toast.error('Periksa kembali isian.'),
        };
        if (isEdit) {
            patch(route('admin.school-missions.update', mission.id), opts);
        } else {
            post(route('admin.school-missions.store'), opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-navy-950/40" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
                <div className="border-b border-navy-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-navy-950">{isEdit ? 'Edit Misi' : 'Tambah Misi'}</h2>
                </div>
                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="body">Isi Misi <span className="text-red-500">*</span></Label>
                        <textarea
                            id="body"
                            rows={3}
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Tuliskan misi sekolah..."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.body && <p className="text-xs text-red-600">{errors.body}</p>}
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

export default function Index({ missions }) {
    const [modal, setModal] = useState(null);

    const handleDelete = (mission) => {
        if (!confirm(`Hapus misi ini?`)) return;
        router.delete(route('admin.school-missions.destroy', mission.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Misi dihapus.'),
            onError:   () => toast.error('Gagal menghapus misi.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Landing Page</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Misi Sekolah</h1>
                </div>
            }
        >
            <Head title="Misi Sekolah" />

            {modal && (
                <MissionModal
                    mission={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Target className="h-4 w-4" />
                        Daftar Misi ({missions.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setModal('create')}>
                        <Plus className="h-4 w-4" />
                        Tambah Misi
                    </Button>
                </CardHeader>
                <CardContent>
                    {missions.length === 0 ? (
                        <div className="py-12 text-center text-sm text-navy-500">
                            Belum ada misi. Klik "Tambah Misi" untuk menambahkan.
                        </div>
                    ) : (
                        <div className="divide-y divide-navy-100">
                            {missions.map((mission, idx) => (
                                <div key={mission.id} className="flex items-start justify-between gap-4 py-4">
                                    <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-navy-50 text-navy-600 font-semibold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1 pt-1">
                                        <p className="text-sm text-navy-900">{mission.body}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setModal(mission)}
                                            aria-label="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(mission)}
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
