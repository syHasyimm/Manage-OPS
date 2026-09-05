import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    AlertTriangle,
    FileText,
    Loader2,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
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

const emptyAssignee = () => ({
    name: '',
    position: '',
    unit_kerja: '',
});

export default function Create({ principal, defaults }) {
    const { data, setData, post, processing, errors } = useForm({
        nomor_surat: '',
        assignees: [emptyAssignee()],
        activity_name: '',
        activity_date: '',
        activity_place: '',
        letter_place: defaults?.letter_place ?? '',
        letter_date: defaults?.letter_date ?? '',
    });

    const activityDateLabel = useMemo(() => {
        if (!data.activity_date) return '-';

        const [year, month, day] = data.activity_date.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return new Intl.DateTimeFormat('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    }, [data.activity_date]);

    const updateAssignee = (index, field, value) => {
        const assignees = data.assignees.map((assignee, assigneeIndex) => (
            assigneeIndex === index ? { ...assignee, [field]: value } : assignee
        ));

        setData('assignees', assignees);
    };

    const addAssignee = () => {
        setData('assignees', [...data.assignees, emptyAssignee()]);
    };

    const removeAssignee = (index) => {
        if (data.assignees.length === 1) return;

        setData('assignees', data.assignees.filter((_, assigneeIndex) => assigneeIndex !== index));
    };

    const assigneeError = (index, field) => errors[`assignees.${index}.${field}`];
    const principalIncomplete = !principal?.name || !principal?.nip;

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.surat-tugas.store'), {
            preserveScroll: true,
            onSuccess: () => window.location.assign(route('admin.surat-tugas.download')),
            onError: () => toast.error('Gagal membuat surat. Periksa kembali isian.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Surat Perintah Tugas</h1>
                    <p className="mt-1 text-xs text-navy-500">
                        Buat surat tugas dengan KOP dan data Kepala Sekolah dari Pengaturan Sekolah.
                    </p>
                </div>
            }
        >
            <Head title="Surat Perintah Tugas" />

            <form onSubmit={submit} className="space-y-4">
                {principalIncomplete && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                            Data nama atau NIP Kepala Sekolah belum lengkap. Lengkapi melalui{' '}
                            <a href={route('admin.school-settings.edit')} className="font-semibold underline">
                                Pengaturan Sekolah
                            </a>{' '}
                            sebelum mencetak surat.
                        </p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4" />
                            Identitas Surat
                        </CardTitle>
                        <CardDescription>Nomor surat/SK diisi manual sesuai administrasi sekolah.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Field label="Nomor Surat / SK" htmlFor="nomor_surat" error={errors.nomor_surat} required>
                            <Input
                                id="nomor_surat"
                                value={data.nomor_surat}
                                onChange={(event) => setData('nomor_surat', event.target.value)}
                                placeholder="800/123/SPT/SD-001/2026"
                                required
                            />
                        </Field>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Data Pemberi Tugas</CardTitle>
                        <CardDescription>Data ini diambil otomatis dari Pengaturan Sekolah.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 rounded-lg border border-navy-100 bg-navy-50/50 p-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-navy-500">Nama</p>
                                <p className="mt-1 text-sm font-semibold text-navy-900">{principal?.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-navy-500">NIP</p>
                                <p className="mt-1 text-sm font-semibold text-navy-900">{principal?.nip || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-navy-500">Jabatan</p>
                                <p className="mt-1 text-sm font-semibold text-navy-900">{principal?.title || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-navy-500">Unit Kerja</p>
                                <p className="mt-1 text-sm font-semibold text-navy-900">{principal?.unit_kerja || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle className="text-base">Data Orang yang Ditugaskan</CardTitle>
                                <CardDescription>Tambahkan satu atau beberapa orang penerima tugas.</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addAssignee}>
                                <Plus className="h-4 w-4" />
                                Tambah Orang
                            </Button>
                        </div>
                        <FieldError message={errors.assignees} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.assignees.map((assignee, index) => (
                            <div key={index} className="rounded-lg border border-navy-100 bg-navy-50/40 p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-navy-900">Penerima Tugas {index + 1}</p>
                                    {data.assignees.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeAssignee(index)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Hapus
                                        </Button>
                                    )}
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Field
                                        label="Nama"
                                        htmlFor={`assignee-${index}-name`}
                                        error={assigneeError(index, 'name')}
                                        required
                                    >
                                        <Input
                                            id={`assignee-${index}-name`}
                                            value={assignee.name}
                                            onChange={(event) => updateAssignee(index, 'name', event.target.value)}
                                            placeholder="Nama lengkap"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Jabatan"
                                        htmlFor={`assignee-${index}-position`}
                                        error={assigneeError(index, 'position')}
                                        required
                                    >
                                        <Input
                                            id={`assignee-${index}-position`}
                                            value={assignee.position}
                                            onChange={(event) => updateAssignee(index, 'position', event.target.value)}
                                            placeholder="Guru / Staf"
                                            required
                                        />
                                    </Field>
                                    <Field
                                        label="Unit Kerja"
                                        htmlFor={`assignee-${index}-unit`}
                                        error={assigneeError(index, 'unit_kerja')}
                                        required
                                    >
                                        <Input
                                            id={`assignee-${index}-unit`}
                                            value={assignee.unit_kerja}
                                            onChange={(event) => updateAssignee(index, 'unit_kerja', event.target.value)}
                                            placeholder="Nama unit kerja"
                                            required
                                        />
                                    </Field>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Kegiatan dan Waktu</CardTitle>
                        <CardDescription>Hari kegiatan akan tampil otomatis berdasarkan tanggal yang dipilih.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field label="Nama Kegiatan / Keperluan" htmlFor="activity_name" error={errors.activity_name} required>
                            <Input
                                id="activity_name"
                                value={data.activity_name}
                                onChange={(event) => setData('activity_name', event.target.value)}
                                placeholder="Mengikuti kegiatan ..."
                                required
                            />
                        </Field>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Tanggal Kegiatan" htmlFor="activity_date" error={errors.activity_date} required>
                                <Input
                                    id="activity_date"
                                    type="date"
                                    value={data.activity_date}
                                    onChange={(event) => setData('activity_date', event.target.value)}
                                    required
                                />
                                <p className="text-xs text-navy-500">Tampil sebagai: {activityDateLabel}</p>
                            </Field>
                            <Field label="Tempat / Lokasi" htmlFor="activity_place" error={errors.activity_place} required>
                                <Input
                                    id="activity_place"
                                    value={data.activity_place}
                                    onChange={(event) => setData('activity_place', event.target.value)}
                                    placeholder="Aula sekolah / nama lokasi"
                                    required
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Tempat dan Tanggal Surat</CardTitle>
                        <CardDescription>Bagian ini dicetak di atas nama Kepala Sekolah dan dapat diubah manual.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Tempat Surat" htmlFor="letter_place" error={errors.letter_place} required>
                                <Input
                                    id="letter_place"
                                    value={data.letter_place}
                                    onChange={(event) => setData('letter_place', event.target.value)}
                                    placeholder="Kepenuhan"
                                    required
                                />
                            </Field>
                            <Field label="Tanggal Surat" htmlFor="letter_date" error={errors.letter_date} required>
                                <Input
                                    id="letter_date"
                                    type="date"
                                    value={data.letter_date}
                                    onChange={(event) => setData('letter_date', event.target.value)}
                                    required
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={processing}>
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Buat & Unduh PDF
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
