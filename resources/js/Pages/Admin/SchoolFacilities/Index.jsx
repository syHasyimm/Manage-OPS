import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Building2, Pencil, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { toast } from 'sonner';

function FacilityModal({ facility, onClose }) {
    const isEdit = !!facility;
    const [preview, setPreview] = useState(facility?.image_url || null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'put' : 'post',
        title:       facility?.title       ?? '',
        description: facility?.description ?? '',
        icon:        facility?.icon        ?? '',
        image:       null,
        remove_image: false,
        is_active:   facility?.is_active   ?? true,
        sort_order:  facility?.sort_order  ?? 0,
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
            onSuccess: () => { toast.success(isEdit ? 'Fasilitas diperbarui.' : 'Fasilitas ditambahkan.'); onClose(); },
            onError:   () => toast.error('Periksa kembali isian.'),
        };
        if (isEdit) {
            post(route('admin.school-facilities.update', facility.id), opts);
        } else {
            post(route('admin.school-facilities.store'), opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-navy-950/40" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 border-b border-navy-100 bg-white px-5 py-4">
                    <h2 className="text-base font-semibold text-navy-950">{isEdit ? 'Edit Fasilitas' : 'Tambah Fasilitas'}</h2>
                </div>
                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Nama Fasilitas <span className="text-red-500">*</span></Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Laboratorium Komputer"
                            />
                            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="icon">Nama Icon (Lucide)</Label>
                            <Input
                                id="icon"
                                value={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                placeholder="Contoh: Monitor"
                            />
                            {errors.icon && <p className="text-xs text-red-600">{errors.icon}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Deskripsi <span className="text-red-500">*</span></Label>
                        <textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Tuliskan deskripsi fasilitas..."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Gambar Fasilitas (Opsional)</Label>
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

export default function Index({ facilities }) {
    const [modal, setModal] = useState(null);

    const handleDelete = (facility) => {
        if (!confirm(`Hapus fasilitas "${facility.title}"?`)) return;
        router.delete(route('admin.school-facilities.destroy', facility.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Fasilitas dihapus.'),
            onError:   () => toast.error('Gagal menghapus fasilitas.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Landing Page</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Fasilitas Sekolah</h1>
                </div>
            }
        >
            <Head title="Fasilitas Sekolah" />

            {modal && (
                <FacilityModal
                    facility={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Building2 className="h-4 w-4" />
                        Daftar Fasilitas ({facilities.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setModal('create')}>
                        <Plus className="h-4 w-4" />
                        Tambah Fasilitas
                    </Button>
                </CardHeader>
                <CardContent>
                    {facilities.length === 0 ? (
                        <div className="py-12 text-center text-sm text-navy-500">
                            Belum ada fasilitas. Klik "Tambah Fasilitas" untuk menambahkan.
                        </div>
                    ) : (
                        <div className="divide-y divide-navy-100">
                            {facilities.map((facility) => (
                                <div key={facility.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        {facility.image_url ? (
                                            <img src={facility.image_url} alt={facility.title} className="h-16 w-24 rounded object-cover border border-navy-100 shrink-0" />
                                        ) : (
                                            <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded bg-navy-50 border border-navy-100 text-navy-300">
                                                <ImageIcon className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-navy-900">{facility.title}</p>
                                                {!facility.is_active && (
                                                    <Badge variant="secondary" className="text-[10px]">Nonaktif</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-navy-600 line-clamp-2 leading-relaxed">{facility.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1 sm:self-start self-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setModal(facility)}
                                            aria-label="Edit"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(facility)}
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
