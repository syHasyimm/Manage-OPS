import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    Bell,
    CheckCircle2,
    Loader2,
    Send,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { toast } from 'sonner';

function FieldError({ message }) {
    if (!message) return null;

    return <p className="text-xs text-red-600">{message}</p>;
}

function Field({ label, htmlFor, hint, error, children, required }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-xs text-navy-500">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}

export default function Create({ templates, categories, variables, grades, school_name, result }) {
    const [studentSearch, setStudentSearch] = useState('');
    const [studentResults, setStudentResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searching, setSearching] = useState(false);
    const form = useForm({
        delivery_mode: 'individual',
        student_id: null,
        tingkat: '',
        rombel: '',
        category: Object.keys(categories)[0] ?? '',
        template_id: '',
        variables: {},
    });

    const categoryTemplates = useMemo(
        () => templates.filter((template) => template.category === form.data.category),
        [templates, form.data.category],
    );
    const selectedTemplate = templates.find((template) => String(template.id) === String(form.data.template_id));
    const manualVariables = variables?.[form.data.category]?.manual ?? {};

    useEffect(() => {
        const firstTemplate = categoryTemplates[0];

        if (firstTemplate && !categoryTemplates.some((template) => String(template.id) === String(form.data.template_id))) {
            form.setData('template_id', String(firstTemplate.id));
        }
    }, [categoryTemplates]);

    useEffect(() => {
        if (form.data.delivery_mode !== 'individual' || selectedStudent || studentSearch.trim().length < 2) {
            setStudentResults([]);
            setSearching(false);

            return undefined;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            setSearching(true);
            axios.get(route('admin.notifications.students'), {
                params: { q: studentSearch },
                signal: controller.signal,
            }).then((response) => {
                setStudentResults(response.data);
            }).catch((error) => {
                if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                    toast.error('Pencarian siswa gagal.');
                }
            }).finally(() => setSearching(false));
        }, 300);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [studentSearch, form.data.delivery_mode, selectedStudent]);

    const selectStudent = (student) => {
        setSelectedStudent(student);
        form.setData('student_id', student.id);
        setStudentSearch(`${student.name} (${student.nis})`);
        setStudentResults([]);
    };

    const clearStudent = (value) => {
        setStudentSearch(value);
        setSelectedStudent(null);
        form.setData('student_id', null);
    };

    const changeMode = (mode) => {
        form.setData('delivery_mode', mode);
        form.setData('student_id', null);
        setSelectedStudent(null);
        setStudentSearch('');
    };

    const updateVariable = (key, value) => {
        form.setData('variables', { ...form.data.variables, [key]: value });
    };

    const previewVariables = {
        nama_siswa: selectedStudent?.name || '[Nama Siswa]',
        kelas: selectedStudent?.kelas || '[Kelas]',
        nama_ortu: selectedStudent?.parent_name || '[Nama Ortu]',
        nama_sekolah: school_name || '[Nama Sekolah]',
        ...form.data.variables,
    };
    const preview = selectedTemplate?.body?.replace(
        /{{\s*([a-zA-Z0-9_]+)\s*}}/g,
        (_, key) => previewVariables[key] || `{{${key}}}`,
    ) ?? 'Pilih template untuk melihat preview.';

    const submit = (event) => {
        event.preventDefault();
        form.post(route('admin.notifications.store'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Notifikasi berhasil dimasukkan ke antrean pengiriman.'),
            onError: () => toast.error('Gagal membuat notifikasi. Periksa kembali data dan variabelnya.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Administrasi</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Buat Notifikasi Ortu</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('admin.notifications.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Riwayat
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={route('admin.notification-templates.index')}>Template Pesan</Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Buat Notifikasi Ortu" />

            <form onSubmit={submit} className="space-y-4">
                {result && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                                <p className="font-semibold">Pengiriman dijadwalkan</p>
                                <p className="mt-1">{result.queued} notifikasi masuk antrean.</p>
                                {result.skipped?.length > 0 && (
                                    <div className="mt-2 text-amber-800">
                                        <p>{result.skipped.length} siswa dilewati karena data ortu belum lengkap:</p>
                                        <ul className="mt-1 list-disc space-y-0.5 pl-5">
                                            {result.skipped.map((student) => (
                                                <li key={student.student_id}>{student.name}: {student.reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Bell className="h-4 w-4" />
                            Penerima Notifikasi
                        </CardTitle>
                        <CardDescription>Pilih pengiriman untuk satu siswa atau seluruh siswa pada tingkat/rombel tertentu.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {[
                                ['individual', 'Satu Siswa'],
                                ['class', 'Broadcast Kelas'],
                            ].map(([value, label]) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={form.data.delivery_mode === value ? 'secondary' : 'outline'}
                                    onClick={() => changeMode(value)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>

                        {form.data.delivery_mode === 'individual' ? (
                            <Field label="Cari Siswa" htmlFor="student_search" error={form.errors.student_id} hint="Ketik minimal 2 karakter nama, NIS, atau NISN." required>
                                <div className="relative">
                                    <Input
                                        id="student_search"
                                        value={studentSearch}
                                        onChange={(event) => clearStudent(event.target.value)}
                                        placeholder="Contoh: Budi atau NIS001"
                                        autoComplete="off"
                                        required
                                    />
                                    {(searching || studentResults.length > 0) && (
                                        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-navy-200 bg-white shadow-lg">
                                            {searching && <p className="px-3 py-2 text-xs text-navy-500">Mencari...</p>}
                                            {!searching && studentResults.map((student) => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-navy-50"
                                                    onClick={() => selectStudent(student)}
                                                >
                                                    <span>
                                                        <span className="block font-medium text-navy-900">{student.name}</span>
                                                        <span className="block text-xs text-navy-500">NIS: {student.nis} · Kelas {student.kelas}</span>
                                                    </span>
                                                    <span className="text-xs text-navy-500">{student.parent_phone || 'No HP kosong'}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Field>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Tingkat" htmlFor="tingkat" error={form.errors.tingkat} hint="Kosongkan rombel untuk seluruh tingkat." required>
                                    <Select
                                        value={form.data.tingkat ? String(form.data.tingkat) : 'none'}
                                        onValueChange={(value) => form.setData('tingkat', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger id="tingkat">
                                            <SelectValue placeholder="Pilih tingkat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Pilih tingkat</SelectItem>
                                            {grades.map((grade) => (
                                                <SelectItem key={grade} value={String(grade)}>Kelas {grade}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label="Rombel" htmlFor="rombel" error={form.errors.rombel} hint="Satu huruf, misalnya A atau B.">
                                    <Input
                                        id="rombel"
                                        value={form.data.rombel}
                                        onChange={(event) => form.setData('rombel', event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1))}
                                        placeholder="Semua rombel"
                                        maxLength={1}
                                    />
                                </Field>
                            </div>
                        )}

                        {selectedStudent && (
                            <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-3 text-sm">
                                <p className="font-semibold text-navy-900">{selectedStudent.name} · Kelas {selectedStudent.kelas}</p>
                                <p className="mt-1 text-xs text-navy-600">
                                    Ortu: {selectedStudent.parent_name || '-'} · No HP: {selectedStudent.parent_phone || '-'}
                                </p>
                                {(!selectedStudent.parent_name || !selectedStudent.parent_phone) && (
                                    <p className="mt-2 flex items-center gap-1 text-xs text-amber-700">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        Data ortu belum lengkap dan tidak dapat dikirimi.
                                    </p>
                                )}
                            </div>
                        )}
                        {form.data.delivery_mode === 'class' && (
                            <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                Siswa tanpa Nama Ortu atau No HP Ortu akan dilewati dan ditampilkan dalam rekap hasil.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Template Pesan</CardTitle>
                        <CardDescription>Pilih kategori dan template yang akan digunakan.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Kategori" htmlFor="category" error={form.errors.category} required>
                            <Select
                                value={form.data.category || 'none'}
                                onValueChange={(value) => {
                                    form.setData('category', value === 'none' ? '' : value);
                                    form.setData('template_id', '');
                                    form.setData('variables', {});
                                }}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Pilih kategori</SelectItem>
                                    {Object.entries(categories).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Template" htmlFor="template_id" error={form.errors.template_id} required>
                            <Select
                                value={form.data.template_id ? String(form.data.template_id) : 'none'}
                                onValueChange={(value) => form.setData('template_id', value === 'none' ? '' : value)}
                            >
                                <SelectTrigger id="template_id">
                                    <SelectValue placeholder="Pilih template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Pilih template</SelectItem>
                                    {categoryTemplates.map((template) => (
                                        <SelectItem key={template.id} value={String(template.id)}>{template.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Variabel Pesan</CardTitle>
                        <CardDescription>Data siswa dan sekolah diisi otomatis. Isi variabel kegiatan di bawah ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Object.entries(manualVariables).length === 0 && (
                            <p className="text-sm text-navy-500">Pilih kategori terlebih dahulu.</p>
                        )}
                        {Object.entries(manualVariables).map(([key, definition]) => (
                            <Field
                                key={key}
                                label={definition.label}
                                htmlFor={`variable-${key}`}
                                error={form.errors[`variables.${key}`]}
                                required
                            >
                                {definition.type === 'textarea' ? (
                                    <textarea
                                        id={`variable-${key}`}
                                        rows={4}
                                        value={form.data.variables[key] ?? ''}
                                        onChange={(event) => updateVariable(key, event.target.value)}
                                        className="w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-950 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
                                        required
                                    />
                                ) : (
                                    <Input
                                        id={`variable-${key}`}
                                        value={form.data.variables[key] ?? ''}
                                        onChange={(event) => updateVariable(key, event.target.value)}
                                        required
                                    />
                                )}
                            </Field>
                        ))}

                        <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-500">Preview Pesan</p>
                            <p className="whitespace-pre-line text-sm leading-6 text-navy-900">{preview}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing || !templates.length}>
                        {form.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Masukkan ke Antrean
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
