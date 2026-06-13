import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { MessageSquare, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { toast } from 'sonner';

function FaqModal({ faq, onClose }) {
    const isEdit = !!faq;

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        question:   faq?.question   ?? '',
        answer:     faq?.answer     ?? '',
        keywords:   faq?.keywords   ?? '',
        is_active:  faq?.is_active  ?? true,
        sort_order: faq?.sort_order ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => { toast.success(isEdit ? 'FAQ diperbarui.' : 'FAQ ditambahkan.'); onClose(); },
            onError:   () => toast.error('Periksa kembali isian.'),
        };
        if (isEdit) {
            patch(route('admin.faqs.update', faq.id), opts);
        } else {
            post(route('admin.faqs.store'), opts);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-navy-950/40" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
                <div className="border-b border-navy-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-navy-950">{isEdit ? 'Edit FAQ' : 'Tambah FAQ'}</h2>
                </div>
                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="question">Pertanyaan <span className="text-red-500">*</span></Label>
                        <Input
                            id="question"
                            value={data.question}
                            onChange={(e) => setData('question', e.target.value)}
                            placeholder="Contoh: Berapa biaya pendaftaran?"
                        />
                        {errors.question && <p className="text-xs text-red-600">{errors.question}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="answer">Jawaban <span className="text-red-500">*</span></Label>
                        <textarea
                            id="answer"
                            rows={4}
                            value={data.answer}
                            onChange={(e) => setData('answer', e.target.value)}
                            placeholder="Tulis jawaban lengkap di sini..."
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        {errors.answer && <p className="text-xs text-red-600">{errors.answer}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="keywords">Keywords</Label>
                        <Input
                            id="keywords"
                            value={data.keywords}
                            onChange={(e) => setData('keywords', e.target.value)}
                            placeholder="biaya, uang pangkal, spp, bayar"
                        />
                        <p className="text-xs text-navy-500">Pisahkan dengan koma. Digunakan untuk mencocokkan pertanyaan user.</p>
                        {errors.keywords && <p className="text-xs text-red-600">{errors.keywords}</p>}
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

export default function Index({ faqs }) {
    const [modal, setModal] = useState(null); // null | 'create' | faq object

    const handleDelete = (faq) => {
        if (!confirm(`Hapus FAQ "${faq.question}"?`)) return;
        router.delete(route('admin.faqs.destroy', faq.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('FAQ dihapus.'),
            onError:   () => toast.error('Gagal menghapus FAQ.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Admin</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Kelola FAQ Chatbot</h1>
                    <p className="mt-1 text-xs text-navy-500">
                        Pertanyaan di sini dijawab langsung dari database tanpa memanggil AI API.
                    </p>
                </div>
            }
        >
            <Head title="Kelola FAQ" />

            {modal && (
                <FaqModal
                    faq={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MessageSquare className="h-4 w-4" />
                        Daftar FAQ ({faqs.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setModal('create')}>
                        <Plus className="h-4 w-4" />
                        Tambah FAQ
                    </Button>
                </CardHeader>
                <CardContent>
                    {faqs.length === 0 ? (
                        <div className="py-12 text-center text-sm text-navy-500">
                            Belum ada FAQ. Klik "Tambah FAQ" untuk menambahkan.
                        </div>
                    ) : (
                        <div className="divide-y divide-navy-100">
                            {faqs.map((faq) => (
                                <div key={faq.id} className="flex items-start justify-between gap-4 py-4">
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-navy-900">{faq.question}</p>
                                            {!faq.is_active && (
                                                <Badge variant="secondary" className="text-[10px]">Nonaktif</Badge>
                                            )}
                                        </div>
                                        <p className="line-clamp-2 text-xs text-navy-600">{faq.answer}</p>
                                        {faq.keywords && (
                                            <p className="text-[11px] text-navy-400">
                                                Keywords: <span className="font-medium text-navy-600">{faq.keywords}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setModal(faq)}
                                            aria-label="Edit FAQ"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(faq)}
                                            className="text-red-600 hover:text-red-700"
                                            aria-label="Hapus FAQ"
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
