import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Image as ImageIcon, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { toast } from 'sonner';

function GalleryModal({ gallery, onClose }) {
    const isEdit = !!gallery;
    const [preview, setPreview] = useState(gallery?.image_url || null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'put' : 'post',
        title:       gallery?.title       ?? '',
        category:    gallery?.category    ?? '',
        image:       null,
        is_active:   gallery?.is_active   ?? true,
        sort_order:  gallery?.sort_order  ?? 0,
    });

    const onImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => { toast.success(isEdit ? 'Foto Galeri diperbarui.' : 'Foto Galeri ditambahkan.'); onClose(); },
            onError:   () => toast.error('Periksa kembali isian.'),
        };
        if (isEdit) {
            post(route('admin.school-galleries.update', gallery.id), opts);
        } else {
            post(route('admin.school-galleries.store'), opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-navy-950/40" onClick={onClose} />
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 border-b border-navy-100 bg-white px-5 py-4">
                    <h2 className="text-base font-semibold text-navy-950">{isEdit ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}</h2>
                </div>
                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                    <div className="space-y-2">
                        <Label>Foto Galeri <span className="text-red-500">*</span></Label>
                        <div className="rounded-md border border-navy-100 bg-navy-50/40 p-4">
                            <div className="mb-3 flex flex-col items-center gap-3">
                                <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-navy-200 bg-white">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto h-8 w-8 text-navy-300" />
                                            <p className="mt-1 text-xs text-navy-400">Pilih gambar</p>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={onImageChange}
                                        className="block w-full text-sm text-navy-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-navy-800"
                                    />
                                    <p className="mt-2 text-xs text-navy-500">Maks 2MB (JPG, PNG)</p>
                                </div>
                            </div>
                            {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Judul / Caption (Opsional)</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Contoh: Kegiatan Upacara Bendera"
                            />
                            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="category">Kategori (Opsional)</Label>
                            <Input
                                id="category"
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                placeholder="Contoh: Kegiatan, Fasilitas"
                            />
                            {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
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
                                <label htmlFor="is_active" className="text-sm text-navy-700">Aktif (Tampilkan di halaman utama)</label>
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

export default function Index({ galleries }) {
    const [modal, setModal] = useState(null);

    const handleDelete = (gallery) => {
        if (!confirm(`Hapus foto galeri ini?`)) return;
        router.delete(route('admin.school-galleries.destroy', gallery.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Foto Galeri dihapus.'),
            onError:   () => toast.error('Gagal menghapus foto galeri.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Landing Page</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Galeri & Foto Sekolah</h1>
                </div>
            }
        >
            <Head title="Galeri & Foto Sekolah" />

            {modal && (
                <GalleryModal
                    gallery={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ImageIcon className="h-4 w-4" />
                        Daftar Foto ({galleries.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setModal('create')}>
                        <Plus className="h-4 w-4" />
                        Tambah Foto
                    </Button>
                </CardHeader>
                <CardContent>
                    {galleries.length === 0 ? (
                        <div className="py-12 text-center text-sm text-navy-500">
                            Belum ada foto galeri. Klik "Tambah Foto" untuk menambahkan.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {galleries.map((item) => (
                                <div key={item.id} className="group relative flex flex-col rounded-xl border border-navy-100 bg-white shadow-sm overflow-hidden">
                                    <div className="relative aspect-video bg-navy-50 border-b border-navy-100 overflow-hidden">
                                        <img src={item.image_url} alt={item.title || 'Galeri'} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                        
                                        <div className="absolute inset-0 bg-navy-950/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center gap-2">
                                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => setModal(item)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDelete(item)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {!item.is_active && (
                                            <div className="absolute top-2 right-2">
                                                <Badge variant="secondary" className="text-[10px]">Nonaktif</Badge>
                                            </div>
                                        )}
                                        {item.category && (
                                            <div className="absolute bottom-2 left-2">
                                                <Badge className="bg-navy-900/80 text-white hover:bg-navy-900/80 border-0">{item.category}</Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-navy-950 line-clamp-1">{item.title || 'Tanpa Judul'}</p>
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
