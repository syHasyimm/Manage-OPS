import { Head, useForm, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    Building2,
    Image as ImageIcon,
    Loader2,
    MapPin,
    Phone,
    Save,
    School,
    Trash2,
    UserCog,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
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

export default function Edit({ setting }) {
    const fileInputRef = useRef(null);
    const regencyFileInputRef = useRef(null);
    const [logoPreview, setLogoPreview] = useState(setting?.logo_url ?? null);
    const [regencyLogoPreview, setRegencyLogoPreview] = useState(setting?.regency_logo_url ?? null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: setting?.name ?? '',
        npsn: setting?.npsn ?? '',
        nss: setting?.nss ?? '',
        accreditation: setting?.accreditation ?? '',
        government_regency: setting?.government_regency ?? '',
        education_office: setting?.education_office ?? '',
        address: setting?.address ?? '',
        village: setting?.village ?? '',
        district: setting?.district ?? '',
        regency: setting?.regency ?? '',
        province: setting?.province ?? '',
        postal_code: setting?.postal_code ?? '',
        phone: setting?.phone ?? '',
        email: setting?.email ?? '',
        website: setting?.website ?? '',
        principal_name: setting?.principal_name ?? '',
        principal_nip: setting?.principal_nip ?? '',
        principal_title: setting?.principal_title ?? 'Kepala Sekolah',
        signature_city: setting?.signature_city ?? '',
        logo: null,
        regency_logo: null,
        _method: 'patch',
    });

    useEffect(() => {
        if (recentlySuccessful) {
            toast.success('Pengaturan tersimpan');
        }
    }, [recentlySuccessful]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.school-settings.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setData('logo', null);
                setData('regency_logo', null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (regencyFileInputRef.current) regencyFileInputRef.current.value = '';
            },
            onError: () => toast.error('Gagal menyimpan. Periksa kembali isian.'),
        });
    };

    const onLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('logo', file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const onRegencyLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setData('regency_logo', file);
        setRegencyLogoPreview(URL.createObjectURL(file));
    };

    const removeLogo = () => {
        if (!confirm('Hapus logo sekolah?')) return;
        router.delete(route('admin.school-settings.logo.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setLogoPreview(null);
                setData('logo', null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                toast.success('Logo dihapus');
            },
        });
    };

    const removeRegencyLogo = () => {
        if (!confirm('Hapus logo kabupaten?')) return;
        router.delete(route('admin.school-settings.regency-logo.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setRegencyLogoPreview(null);
                setData('regency_logo', null);
                if (regencyFileInputRef.current) regencyFileInputRef.current.value = '';
                toast.success('Logo kabupaten dihapus');
            },
        });
    };

    // Build full address preview
    const fullAddressPreview = [
        data.address,
        data.village ? `Desa ${data.village}` : null,
        data.district ? `Kec. ${data.district}` : null,
        data.regency ? `Kab. ${data.regency}` : null,
        data.province,
        data.postal_code,
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Admin</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Pengaturan Sekolah</h1>
                    <p className="mt-1 text-xs text-navy-500">
                        Identitas sekolah ini akan tampil pada KOP PDF formulir pendaftaran.
                    </p>
                </div>
            }
        >
            <Head title="Pengaturan Sekolah" />

            <form onSubmit={submit} className="space-y-4">
                {/* Preview KOP */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Preview KOP</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-navy-200 bg-white p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-navy-200 bg-navy-50">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="h-full w-full object-contain" />
                                    ) : (
                                        <span className="text-[10px] text-navy-400">LOGO</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 text-center">
                                    {data.government_regency && (
                                        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[10px] font-bold uppercase leading-tight text-navy-900">
                                            {data.government_regency}
                                        </p>
                                    )}
                                    {data.education_office && (
                                        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[10px] font-bold uppercase leading-tight text-navy-900">
                                            {data.education_office}
                                        </p>
                                    )}
                                    <p className="mt-0.5 break-words text-xs font-bold uppercase tracking-wide text-navy-900">
                                        {data.name || 'Nama Sekolah'}
                                    </p>
                                    {fullAddressPreview && (
                                        <p className="mt-0.5 break-words text-[10px] text-navy-700">{fullAddressPreview}</p>
                                    )}
                                    {(data.phone || data.email || data.website) && (
                                        <p className="text-[10px] text-navy-500">
                                            {[data.phone && `Telp: ${data.phone}`, data.email && `Email: ${data.email}`, data.website && `Web: ${data.website}`]
                                                .filter(Boolean)
                                                .join(' | ')}
                                        </p>
                                    )}
                                    {(data.npsn || data.accreditation) && (
                                        <p className="text-[10px] text-navy-500">
                                            {[data.npsn && `NPSN: ${data.npsn}`, data.accreditation && `Akreditasi: ${data.accreditation}`]
                                                .filter(Boolean)
                                                .join(' | ')}
                                        </p>
                                    )}
                                </div>
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-navy-200 bg-navy-50">
                                    {regencyLogoPreview ? (
                                        <img src={regencyLogoPreview} alt="Logo Kabupaten" className="h-full w-full object-contain" />
                                    ) : (
                                        <span className="text-[10px] text-navy-400">KAB.</span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 border-t-2 border-double border-navy-900" />
                        </div>
                        <p className="mt-2 text-xs text-navy-500">
                            Tampilan akhir di PDF mengikuti template KOP resmi (logo sekolah kiri, identitas tengah, logo kabupaten kanan, garis ganda di bawah).
                        </p>
                    </CardContent>
                </Card>

                {/* Logo & Identitas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <School className="h-4 w-4" />
                            Logo & Identitas Sekolah
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Logo Sekolah */}
                            <div className="rounded-md border border-navy-100 bg-navy-50/40 p-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-navy-200 bg-white">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Preview Logo Sekolah" className="h-full w-full object-contain" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-navy-300" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-navy-900">Logo Sekolah</p>
                                        <p className="text-xs text-navy-500">Tampil di kiri KOP PDF</p>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    id="logo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={onLogoChange}
                                    className="block w-full text-sm text-navy-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-navy-800"
                                />
                                <p className="mt-2 text-xs text-navy-500">PNG / JPG, maks 1 MB. Disarankan rasio 1:1.</p>
                                <FieldError message={errors.logo} />
                                {setting?.logo_path && (
                                    <Button type="button" variant="outline" size="sm" onClick={removeLogo} className="mt-2">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Hapus Logo Sekolah
                                    </Button>
                                )}
                            </div>

                            {/* Logo Kabupaten */}
                            <div className="rounded-md border border-navy-100 bg-navy-50/40 p-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-navy-200 bg-white">
                                        {regencyLogoPreview ? (
                                            <img src={regencyLogoPreview} alt="Preview Logo Kabupaten" className="h-full w-full object-contain" />
                                        ) : (
                                            <ImageIcon className="h-6 w-6 text-navy-300" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-navy-900">Logo Kabupaten / Dinas</p>
                                        <p className="text-xs text-navy-500">Tampil di kanan KOP PDF</p>
                                    </div>
                                </div>
                                <input
                                    ref={regencyFileInputRef}
                                    id="regency_logo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={onRegencyLogoChange}
                                    className="block w-full text-sm text-navy-700 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-navy-800"
                                />
                                <p className="mt-2 text-xs text-navy-500">PNG / JPG, maks 1 MB. Disarankan rasio 1:1.</p>
                                <FieldError message={errors.regency_logo} />
                                {setting?.regency_logo_path && (
                                    <Button type="button" variant="outline" size="sm" onClick={removeRegencyLogo} className="mt-2">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Hapus Logo Kabupaten
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Nama Sekolah" htmlFor="name" required error={errors.name}>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="SD Negeri 001 Kepenuhan"
                                />
                            </Field>
                            <Field label="NPSN" htmlFor="npsn" error={errors.npsn} hint="Nomor Pokok Sekolah Nasional">
                                <Input
                                    id="npsn"
                                    value={data.npsn}
                                    onChange={(e) => setData('npsn', e.target.value)}
                                />
                            </Field>
                            <Field label="NSS" htmlFor="nss" error={errors.nss} hint="Opsional">
                                <Input
                                    id="nss"
                                    value={data.nss}
                                    onChange={(e) => setData('nss', e.target.value)}
                                />
                            </Field>
                            <Field label="Akreditasi" htmlFor="accreditation" error={errors.accreditation} hint="A / B / C">
                                <Input
                                    id="accreditation"
                                    value={data.accreditation}
                                    onChange={(e) => setData('accreditation', e.target.value.toUpperCase().slice(0, 5))}
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                {/* Hierarki Pemerintahan */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Building2 className="h-4 w-4" />
                            Hierarki Pemerintahan (KOP)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Pemerintah Kabupaten/Kota" htmlFor="government_regency" error={errors.government_regency} hint="contoh: Pemerintah Kabupaten Rokan Hulu">
                                <Input
                                    id="government_regency"
                                    value={data.government_regency}
                                    onChange={(e) => setData('government_regency', e.target.value)}
                                />
                            </Field>
                            <Field label="Dinas Pendidikan" htmlFor="education_office" error={errors.education_office}>
                                <Input
                                    id="education_office"
                                    value={data.education_office}
                                    onChange={(e) => setData('education_office', e.target.value)}
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                {/* Alamat */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MapPin className="h-4 w-4" />
                            Alamat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field label="Alamat (jalan, nomor)" htmlFor="address" error={errors.address}>
                            <Textarea
                                id="address"
                                rows={2}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Jl. ..."
                            />
                        </Field>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Desa / Kelurahan" htmlFor="village" error={errors.village}>
                                <Input id="village" value={data.village} onChange={(e) => setData('village', e.target.value)} />
                            </Field>
                            <Field label="Kecamatan" htmlFor="district" error={errors.district}>
                                <Input id="district" value={data.district} onChange={(e) => setData('district', e.target.value)} />
                            </Field>
                            <Field label="Kabupaten / Kota" htmlFor="regency" error={errors.regency}>
                                <Input id="regency" value={data.regency} onChange={(e) => setData('regency', e.target.value)} />
                            </Field>
                            <Field label="Provinsi" htmlFor="province" error={errors.province}>
                                <Input id="province" value={data.province} onChange={(e) => setData('province', e.target.value)} />
                            </Field>
                            <Field label="Kode Pos" htmlFor="postal_code" error={errors.postal_code}>
                                <Input
                                    id="postal_code"
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                {/* Kontak */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Phone className="h-4 w-4" />
                            Kontak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Telepon" htmlFor="phone" error={errors.phone}>
                                <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                            </Field>
                            <Field label="Email" htmlFor="email" error={errors.email}>
                                <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                            </Field>
                            <Field label="Website" htmlFor="website" error={errors.website}>
                                <Input id="website" value={data.website} onChange={(e) => setData('website', e.target.value)} placeholder="sd001kepenuhan.sch.id" />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                {/* Kepala Sekolah */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserCog className="h-4 w-4" />
                            Kepala Sekolah & Tanda Tangan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Nama Kepala Sekolah" htmlFor="principal_name" error={errors.principal_name}>
                                <Input
                                    id="principal_name"
                                    value={data.principal_name}
                                    onChange={(e) => setData('principal_name', e.target.value)}
                                />
                            </Field>
                            <Field label="NIP" htmlFor="principal_nip" error={errors.principal_nip}>
                                <Input
                                    id="principal_nip"
                                    value={data.principal_nip}
                                    onChange={(e) => setData('principal_nip', e.target.value)}
                                />
                            </Field>
                            <Field label="Jabatan" htmlFor="principal_title" error={errors.principal_title}>
                                <Input
                                    id="principal_title"
                                    value={data.principal_title}
                                    onChange={(e) => setData('principal_title', e.target.value)}
                                />
                            </Field>
                            <Field label="Kota Tanda Tangan" htmlFor="signature_city" error={errors.signature_city} hint="Lokasi yang dicetak di atas tanggal di PDF">
                                <Input
                                    id="signature_city"
                                    value={data.signature_city}
                                    onChange={(e) => setData('signature_city', e.target.value)}
                                    placeholder={data.district || 'Kepenuhan'}
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={processing}>
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Simpan Pengaturan
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
