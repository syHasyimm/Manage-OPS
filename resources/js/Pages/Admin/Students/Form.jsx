import { Head, Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import {
    ArrowLeft,
    Image as ImageIcon,
    Loader2,
    Save,
    Trash2,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
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

export default function StudentForm({ student, religions, genders, grades, mode = 'create' }) {
    const isEdit = mode === 'edit';
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(student?.photo_url ?? null);
    const form = useForm({
        name: student?.name ?? '',
        nis: student?.nis ?? '',
        nisn: student?.nisn ?? '',
        nik: student?.nik ?? '',
        gender: student?.gender ?? '',
        birth_place: student?.birth_place ?? '',
        birth_date: student?.birth_date ?? '',
        religion: student?.religion ?? '',
        address: student?.address ?? '',
        parent_phone: student?.parent_phone ?? '',
        parent_name: student?.parent_name ?? '',
        previous_school: student?.previous_school ?? '',
        tingkat: student?.tingkat ?? '',
        rombel: student?.rombel ?? '',
        photo: null,
        remove_photo: false,
        _method: isEdit ? 'patch' : null,
    });

    const setPhoto = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        form.setData('photo', file);
        form.setData('remove_photo', false);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const clearPhoto = () => {
        form.setData('photo', null);
        form.setData('remove_photo', Boolean(student?.photo_path));
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (event) => {
        event.preventDefault();

        form.post(
            isEdit
                ? route('admin.students.update', { student: student.id })
                : route('admin.students.store'),
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => toast.success(isEdit ? 'Data siswa berhasil diperbarui.' : 'Data siswa berhasil ditambahkan.'),
                onError: () => toast.error('Gagal menyimpan. Periksa kembali isian.'),
            },
        );
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Manage OPS</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">
                            {isEdit ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
                        </h1>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route('admin.students.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title={isEdit ? 'Edit Data Siswa' : 'Tambah Data Siswa'} />

            <form onSubmit={submit} className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Identitas Siswa</CardTitle>
                        <CardDescription>Isi data identitas sesuai dokumen resmi siswa.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Nama Lengkap" htmlFor="name" error={form.errors.name} required>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) => form.setData('name', event.target.value)}
                                    placeholder="Nama lengkap siswa"
                                    required
                                />
                            </Field>
                            <Field label="NIS" htmlFor="nis" error={form.errors.nis} required>
                                <Input
                                    id="nis"
                                    value={form.data.nis}
                                    onChange={(event) => form.setData('nis', event.target.value)}
                                    placeholder="Nomor Induk Siswa"
                                    required
                                />
                            </Field>
                            <Field label="NISN" htmlFor="nisn" error={form.errors.nisn} hint="10 digit" required>
                                <Input
                                    id="nisn"
                                    value={form.data.nisn}
                                    onChange={(event) => form.setData('nisn', event.target.value.replace(/\D/g, '').slice(0, 10))}
                                    inputMode="numeric"
                                    maxLength={10}
                                    required
                                />
                            </Field>
                            <Field label="NIK" htmlFor="nik" error={form.errors.nik} hint="16 digit" required>
                                <Input
                                    id="nik"
                                    value={form.data.nik}
                                    onChange={(event) => form.setData('nik', event.target.value.replace(/\D/g, '').slice(0, 16))}
                                    inputMode="numeric"
                                    maxLength={16}
                                    required
                                />
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Jenis Kelamin" htmlFor="gender" error={form.errors.gender} required>
                                <Select
                                    value={form.data.gender || 'none'}
                                    onValueChange={(value) => form.setData('gender', value === 'none' ? '' : value)}
                                >
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Pilih jenis kelamin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Pilih jenis kelamin</SelectItem>
                                        {(genders ?? []).map((g) => (
                                            <SelectItem key={g.value} value={g.value}>
                                                {g.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Asal Sekolah" htmlFor="previous_school" error={form.errors.previous_school} hint="Opsional. Sekolah sebelumnya.">
                                <Input
                                    id="previous_school"
                                    value={form.data.previous_school}
                                    onChange={(event) => form.setData('previous_school', event.target.value)}
                                    placeholder="Nama sekolah asal"
                                />
                            </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Tempat Lahir" htmlFor="birth_place" error={form.errors.birth_place} required>
                                <Input
                                    id="birth_place"
                                    value={form.data.birth_place}
                                    onChange={(event) => form.setData('birth_place', event.target.value)}
                                    required
                                />
                            </Field>
                            <Field label="Tanggal Lahir" htmlFor="birth_date" error={form.errors.birth_date} required>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={form.data.birth_date}
                                    onChange={(event) => form.setData('birth_date', event.target.value)}
                                    required
                                />
                            </Field>
                            <Field label="Agama" htmlFor="religion" error={form.errors.religion} required>
                                <Select
                                    value={form.data.religion || 'none'}
                                    onValueChange={(value) => form.setData('religion', value === 'none' ? '' : value)}
                                >
                                    <SelectTrigger id="religion">
                                        <SelectValue placeholder="Pilih agama" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Pilih agama</SelectItem>
                                        {religions.map((religion) => (
                                            <SelectItem key={religion.value} value={religion.value}>
                                                {religion.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field label="Kelas" htmlFor="tingkat" error={form.errors.tingkat || form.errors.rombel} hint="Tingkat 1-6, rombel opsional" required>
                                <div className="flex gap-2">
                                    <Select
                                        value={form.data.tingkat ? String(form.data.tingkat) : 'none'}
                                        onValueChange={(value) => form.setData('tingkat', value === 'none' ? '' : value)}
                                    >
                                        <SelectTrigger id="tingkat" className="flex-1">
                                            <SelectValue placeholder="Tingkat" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Tingkat</SelectItem>
                                            {grades.map((grade) => (
                                                <SelectItem key={grade} value={String(grade)}>
                                                    Kelas {grade}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        id="rombel"
                                        className="w-24"
                                        value={form.data.rombel}
                                        onChange={(event) => form.setData('rombel', event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1))}
                                        placeholder="A"
                                        maxLength={1}
                                        aria-label="Rombel"
                                    />
                                </div>
                            </Field>
                        </div>

                        <Field label="Alamat" htmlFor="address" error={form.errors.address} required>
                            <Textarea
                                id="address"
                                rows={3}
                                value={form.data.address}
                                onChange={(event) => form.setData('address', event.target.value)}
                                placeholder="Alamat lengkap siswa"
                                required
                            />
                        </Field>
                        <Field label="No HP Ortu" htmlFor="parent_phone" error={form.errors.parent_phone} hint="Nomor WhatsApp/telepon orang tua atau wali" required>
                            <Input
                                id="parent_phone"
                                type="tel"
                                value={form.data.parent_phone ?? ''}
                                onChange={(event) => form.setData('parent_phone', event.target.value.replace(/[^0-9+()\s-]/g, '').slice(0, 20))}
                                inputMode="tel"
                                placeholder="08xxxxxxxxxx"
                                maxLength={20}
                                required
                            />
                        </Field>
                        <Field label="Nama Ortu" htmlFor="parent_name" error={form.errors.parent_name} hint="Nama orang tua atau wali siswa" required>
                            <Input
                                id="parent_name"
                                value={form.data.parent_name ?? ''}
                                onChange={(event) => form.setData('parent_name', event.target.value)}
                                placeholder="Nama orang tua atau wali"
                                required
                            />
                        </Field>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Foto Siswa</CardTitle>
                        <CardDescription>Opsional. Format PNG/JPG dengan ukuran maksimal 1 MB.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-navy-200 bg-navy-50">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview foto siswa" className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-navy-300" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                                <Input
                                    ref={fileInputRef}
                                    id="photo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={setPhoto}
                                    className="h-auto py-2"
                                />
                                <FieldError message={form.errors.photo} />
                                {(photoPreview || student?.photo_path) && (
                                    <Button type="button" variant="outline" size="sm" onClick={clearPhoto}>
                                        <Trash2 className="h-4 w-4" />
                                        Hapus Foto
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Simpan Data Siswa
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
