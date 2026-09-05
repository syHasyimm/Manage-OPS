import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Braces,
    MessageSquareText,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { toast } from 'sonner';

function TemplateModal({ template, categories, variables, onClose }) {
    const isEdit = Boolean(template);
    const form = useForm({
        category: template?.category ?? Object.keys(categories)[0] ?? '',
        name: template?.name ?? '',
        body: template?.body ?? '',
    });
    const definitions = variables?.[form.data.category] ?? { auto: {}, manual: {} };
    const availableVariables = [
        ...Object.keys(definitions.auto ?? {}),
        ...Object.keys(definitions.manual ?? {}),
    ];

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(isEdit ? 'Template diperbarui.' : 'Template ditambahkan.');
                onClose();
            },
            onError: () => toast.error('Periksa nama dan placeholder template.'),
        };

        if (isEdit) {
            form.patch(route('admin.notification-templates.update', template.id), options);
        } else {
            form.post(route('admin.notification-templates.store'), options);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-navy-950/40" onClick={onClose} />
            <div className="relative my-8 w-full max-w-2xl rounded-xl bg-white shadow-2xl">
                <div className="border-b border-navy-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-navy-950">{isEdit ? 'Edit Template' : 'Tambah Template'}</h2>
                </div>
                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="template-category">Kategori</Label>
                            <Select
                                value={form.data.category}
                                onValueChange={(value) => form.setData('category', value)}
                                disabled={isEdit}
                            >
                                <SelectTrigger id="template-category"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categories).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.category && <p className="text-xs text-red-600">{form.errors.category}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="template-name">Nama Template</Label>
                            <Input
                                id="template-name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                placeholder="Contoh: Undangan Rapat"
                            />
                            {form.errors.name && <p className="text-xs text-red-600">{form.errors.name}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="template-body">Isi Template</Label>
                        <textarea
                            id="template-body"
                            rows={13}
                            value={form.data.body}
                            onChange={(event) => form.setData('body', event.target.value)}
                            placeholder="Tulis pesan menggunakan {{nama_siswa}}..."
                            className="w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-950 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                        />
                        {form.errors.body && <p className="text-xs text-red-600">{form.errors.body}</p>}
                    </div>

                    <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-3">
                        <p className="flex items-center gap-2 text-xs font-semibold text-navy-700">
                            <Braces className="h-3.5 w-3.5" />
                            Placeholder yang tersedia
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {availableVariables.map((variable) => (
                                <Badge key={variable} variant="outline" className="font-mono text-[11px]">{'{{'}{variable}{'}}'}</Badge>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={form.processing}>{form.processing ? 'Menyimpan...' : 'Simpan'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Index({ templates, categories, variables }) {
    const [modal, setModal] = useState(null);

    const remove = (template) => {
        if (! window.confirm(`Hapus template "${template.name}"? Riwayat pengiriman tetap dipertahankan.`)) return;

        router.delete(route('admin.notification-templates.destroy', template.id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Template dihapus.'),
            onError: () => toast.error('Template tidak dapat dihapus.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Administrasi</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Template Pesan WhatsApp</h1>
                        <p className="mt-1 text-xs text-navy-500">Kelola pesan dengan placeholder yang akan diisi otomatis atau oleh staff.</p>
                    </div>
                    <Button type="button" onClick={() => setModal('create')}>
                        <Plus className="h-4 w-4" />
                        Tambah Template
                    </Button>
                </div>
            }
        >
            <Head title="Template Pesan WhatsApp" />

            {modal && (
                <TemplateModal
                    template={modal === 'create' ? null : modal}
                    categories={categories}
                    variables={variables}
                    onClose={() => setModal(null)}
                />
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MessageSquareText className="h-4 w-4" />
                        Daftar Template ({templates.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {templates.length === 0 ? (
                        <div className="py-12 text-center text-sm text-navy-500">Belum ada template pesan.</div>
                    ) : (
                        <div className="divide-y divide-navy-100">
                            {templates.map((template) => (
                                <div key={template.id} className="flex items-start justify-between gap-4 py-4">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-navy-900">{template.name}</p>
                                            <Badge variant="secondary">{categories[template.category] ?? template.category}</Badge>
                                        </div>
                                        <p className="line-clamp-4 whitespace-pre-line text-xs leading-5 text-navy-600">{template.body}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setModal(template)} aria-label="Edit template">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(template)} className="text-red-600 hover:text-red-700" aria-label="Hapus template">
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
