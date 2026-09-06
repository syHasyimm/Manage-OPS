import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Activity, Pencil, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { toast } from 'sonner';

function ExtracurricularModal({ extracurricular, onClose }) {
    const isEdit = !!extracurricular;
    const [preview, setPreview] = useState(extracurricular?.image_url || null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'put' : 'post',
        name:        extracurricular?.name       ?? '',
        category:    extracurricular?.category   ?? '',
        badge:       extracurricular?.badge      ?? '',
        image:       null,
        remove_image: false,
        is_active:   extracurricular?.is_active  ?? true,
        sort_order:  extracurricular?.sort_order ?? 0,
    });

    const onImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setData('remove_image', false);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData('image', null);
        setData('remove_image', true);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => { toast.success(isEdit ? 'Ekstrakurikuler diperbarui.' : 'Ekstrakurikuler ditambahkan.'); onClose(); },
            onError:   () => toast.error('Periksa kembali isian.'),
        };
        if (isEdit) {
            post(route('admin.extracurriculars.update', extracurricular.id), opts);
        } else {
            post(route('admin.extracurriculars.store'), opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-navy-950/40" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 border-b border-navy-100 bg-white px-5 py-4">
                    <h2 className="text-base font-semibold text-navy-950">{isEdit ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}</h2>
                </div>
                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Nama Ekstrakurikuler <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Pramuka"
                            />
                            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="category">Kategori (Opsional)</Label>
                            <Input
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                placeholder="Contoh: Olahraga, Seni"
                            />
                            {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="badge">Teks Label / Badge (Opsional)</Label>
                        <Input
                            id="badge"
                            value={data.badge}
                            onChange={(e) => setData('badge', e.target.value)}
                            placeholder="Contoh: Wajib, Pilihan"
                        />
                        {errors.badge && <p className="text-xs text-red-600">{errors.badge}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Gambar Dokumentasi (Opsional)</Label>
                        <div className="rounded-md border border-navy-100 bg-navy-50/40 p-4">
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-navy-200 bg-white">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-6 w-6 text-navy-300" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-navy-900">Upload Gambar</p>
                                    <p className="text-xs text-navy-500">Maks 2MB (JPG, PNG)</p>
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                onChange={onImageChange}
                                className="block w-full text-sm text-navy-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-navy-800"
                            />
                            {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
                            {preview && (
                                <Button type="button" variant="outline" size="sm" onClick={removeImage} className="mt-2 text-xs h-7">
                                    <Trash2 className="h-3 w-3 mr-1" /> Hapus Gambar
                                </Button>
                            )}
                        </div>
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

                    <div className="sticky bottom-0 flex justify-end gap-2 border-t border-navy-100 bg-white pt-4 pb-2">
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

export default function Index({ extracurriculars }) {
    const [modal, setModal] = useState(null);

    const handleDelete = (extracurricular) => {
        if (!confirm(`Hapus ekstrakurikuler "${extracurricular.name}"?`)) return;
        router.delete(route('admin.extracurriculars.destroy', extracurricular.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Ekstrakurikuler dihapus.'),
            onError:   () => toast.error('Gagal menghapus ekstrakurikuler.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Landing Page</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Ekstrakurikuler</h1>
                </div>
            }
        >
            <Head title="Ekstrakurikuler" />

            {modal && (
                <ExtracurricularModal
                    extracurricular={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-4 w-4" />
                        Daftar Ekstrakurikuler ({extracurriculars.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setModal('create')}>
                        <Plus className="h-4 w-4" />
                        Tambah Eskul
                    </Button>
                </CardHeader>
                <CardContent>
                    {extracurriculars.length === 0 ? (
                        <div className="py-12 text-center text-sm text-navy-500">
                            Belum ada ekstrakurikuler. Klik "Tambah Eskul" untuk menambahkan.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {extracurriculars.map((item) => (
                                <div key={item.id} className="flex flex-col rounded-xl border border-navy-100 bg-white shadow-sm overflow-hidden">
                                    <div className="relative h-32 bg-navy-50 border-b border-navy-100">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-navy-300">
                                                <ImageIcon className="h-8 w-8 opacity-50" />
                                            </div>
                                        )}
                                        {item.badge && (
                                            <div className="absolute top-2 right-2">
                                                <Badge className="bg-gold-500 text-navy-950 hover:bg-gold-500">{item.badge}</Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1 p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-medium text-navy-500 uppercase tracking-wider">{item.category || 'Umum'}</p>
                                            {!item.is_active && (
                                                <Badge variant="secondary" className="text-[10px]">Nonaktif</Badge>
                                            )}
                                        </div>
                                        <p className="text-base font-semibold text-navy-950 line-clamp-1 flex-1">{item.name}</p>
                                        
                                        <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-navy-50">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setModal(item)}
                                                className="h-8 text-xs"
                                            >
                                                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(item)}
                                                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Hapus
                                            </Button>
                                        </div>
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
