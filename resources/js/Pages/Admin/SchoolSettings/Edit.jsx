import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowUpRight,
    Building2,
    CheckCircle2,
    ChevronDown,
    FileText,
    Image as ImageIcon,
    Info,
    Loader2,
    MapPin,
    PencilLine,
    Save,
    School,
    Trash2,
    Upload,
    UserCog,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const inputClass = 'h-11 rounded-lg border-slate-100 bg-slate-50/30 text-sm transition-colors placeholder:text-slate-500 hover:border-slate-200 focus:bg-white';

function Field({ label, htmlFor, hint, error, children, required }) {
    return (
        <div className="min-w-0 space-y-2">
            <Label htmlFor={htmlFor} className="text-[13px] font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-blue-700" aria-hidden="true">*</span>}
            </Label>
            {children}
            {(error || hint) && (
                <p id={`${htmlFor}-help`} className={cn('text-xs leading-relaxed', error ? 'text-red-600' : 'text-slate-500')}>
                    {error || hint}
                </p>
            )}
        </div>
    );
}

function FormSection({ id, icon: Icon, title, description, children }) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 rounded-2xl border border-slate-100/80 bg-white">
            <div className="flex items-start gap-3 border-b border-slate-100/70 px-5 py-5 sm:px-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                    <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                </span>
                <div>
                    <h2 id={`${id}-title`} className="font-display text-lg font-semibold tracking-tight text-slate-950">{title}</h2>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{description}</p>
                </div>
            </div>
            <div className="space-y-6 p-5 sm:p-6">{children}</div>
        </section>
    );
}

function LogoUpload({ id, title, position, preview, file, stored, inputRef, onChange, onRemove, error, disabled }) {
    return (
        <div className="min-w-0">
            <label
                htmlFor={id}
                className={cn(
                    'group relative flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50/40 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-400 focus-within:ring-offset-2',
                    error && 'border-red-400',
                    disabled && 'pointer-events-none opacity-60',
                )}
            >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white p-1.5">
                    {preview ? <img src={preview} alt={title} className="h-full w-full object-contain" /> : <ImageIcon className="h-6 w-6 text-slate-400" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-slate-900">{title}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{position} KOP</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                        <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                        {preview ? 'Ganti gambar' : 'Pilih gambar'}
                    </span>
                </span>
                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={onChange}
                    disabled={disabled}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${id}-help`}
                    className="sr-only"
                />
            </label>
            <div className="mt-2 flex min-h-5 items-start justify-between gap-2">
                <p id={`${id}-help`} className={cn('min-w-0 break-all text-[11px] leading-relaxed', error ? 'text-red-600' : 'text-slate-500')}>
                    {error || file?.name || 'PNG / JPG, maks. 1 MB'}
                </p>
                {stored && (
                    <button type="button" onClick={onRemove} disabled={disabled} aria-label={`Hapus ${title.toLowerCase()}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded px-1 text-[11px] font-medium text-slate-500 transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50">
                        <Trash2 className="h-3 w-3" aria-hidden="true" /> Hapus
                    </button>
                )}
            </div>
        </div>
    );
}

function useLogoPreview(file, savedUrl) {
    const [objectUrl, setObjectUrl] = useState(null);
    useEffect(() => {
        if (!file) {
            setObjectUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    return file ? objectUrl : savedUrl;
}

function KopPreview({ data, logo, regencyLogo, fullAddress }) {
    const metadata = [
        data.phone && `Telp. ${data.phone}`,
        data.email,
        data.website,
    ].filter(Boolean).join(' | ');

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100/80 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100/70 px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    Pratinjau KOP
                </div>
                <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">Sesuai isian</span>
            </div>
            <div className="bg-slate-50/60 p-4 sm:p-5">
                <div className="rounded-sm border border-slate-100/70 bg-white px-4 pb-6 pt-7 shadow-[0_8px_24px_-12px_rgba(30,58,95,0.2)]">
                    <div className="grid grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-2">
                        {[logo, regencyLogo].map((src, index) => (
                            <div key={index} className={cn('flex h-11 items-center justify-center', index === 1 && 'col-start-3 row-start-1')}>
                                {src ? (
                                    <img src={src} alt={index === 0 ? 'Logo sekolah pada KOP' : 'Logo kabupaten pada KOP'} className="max-h-11 w-full object-contain" />
                                ) : (
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-slate-200 text-[7px] text-slate-500">{index === 0 ? 'LOGO' : 'KAB.'}</span>
                                )}
                            </div>
                        ))}
                        <div className="col-start-2 row-start-1 min-w-0 break-words text-center">
                            <p className="font-serif text-[11px] font-bold uppercase leading-tight text-slate-900">{data.government_regency}</p>
                            <p className="font-serif text-[11px] font-bold uppercase leading-tight text-slate-900">{data.education_office}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase leading-snug text-slate-900">{data.name || 'Nama sekolah'}</p>
                            {fullAddress && <p className="mt-1 text-[8px] leading-relaxed text-slate-700">{fullAddress}</p>}
                            {metadata && <p className="mt-0.5 break-all text-[8px] leading-relaxed text-slate-600">{metadata}</p>}
                            {(data.npsn || data.accreditation) && (
                                <p className="mt-0.5 text-[8px] leading-relaxed text-slate-600">
                                    {[data.npsn && `NPSN: ${data.npsn}`, data.accreditation && `Akreditasi: ${data.accreditation}`].filter(Boolean).join(' | ')}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mt-3 border-t-[3px] border-double border-slate-900" />
                    <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-800">Formulir pendaftaran murid baru</p>
                    <div className="mt-12 ml-auto w-3/4 text-center text-[9px] leading-relaxed text-slate-700">
                        <p>{data.signature_city || data.district || 'Kota tanda tangan'}</p>
                        <p>{data.principal_title || 'Kepala Sekolah'}</p>
                        <p className="mt-10 break-words font-semibold underline underline-offset-2">{data.principal_name || 'Nama kepala sekolah'}</p>
                        <p className="mt-1">NIP. {data.principal_nip || '-'}</p>
                    </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">Pratinjau menyesuaikan isian Anda. Tata letak akhir mengikuti template PDF resmi.</p>
            </div>
        </div>
    );
}

export default function Edit({ setting }) {
    const fileInputRef = useRef(null);
    const regencyFileInputRef = useRef(null);
    const { data, setData, post, reset, clearErrors, processing, errors, isDirty, recentlySuccessful, progress } = useForm({
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
        principal_rank: setting?.principal_rank ?? '',
        principal_grade: setting?.principal_grade ?? '',
        signature_city: setting?.signature_city ?? '',
        logo: null,
        regency_logo: null,
        _method: 'patch',
    });
    const logoPreview = useLogoPreview(data.logo, setting?.logo_url);
    const regencyLogoPreview = useLogoPreview(data.regency_logo, setting?.regency_logo_url);
    const [deletingLogo, setDeletingLogo] = useState(false);

    const clearFileInputs = () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (regencyFileInputRef.current) regencyFileInputRef.current.value = '';
    };

    const submit = (event) => {
        event.preventDefault();
        if (processing || deletingLogo) return;
        post(route('admin.school-settings.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setData(current => ({ ...current, logo: null, regency_logo: null }));
                clearFileInputs();
                toast.success('Pengaturan KOP tersimpan');
            },
            onError: (validationErrors) => {
                toast.error('Periksa kembali isian yang ditandai.');
                const firstField = Object.keys(validationErrors)[0];
                document.getElementById(firstField)?.focus();
            },
        });
    };

    const removeLogo = (field) => {
        const schoolLogo = field === 'logo';
        if (!confirm(`Hapus logo ${schoolLogo ? 'sekolah' : 'kabupaten'}?`)) return;
        setDeletingLogo(true);
        router.delete(route(schoolLogo ? 'admin.school-settings.logo.destroy' : 'admin.school-settings.regency-logo.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setData(field, null);
                const input = schoolLogo ? fileInputRef : regencyFileInputRef;
                if (input.current) input.current.value = '';
                clearErrors(field);
                toast.success('Logo dihapus');
            },
            onError: () => toast.error('Logo belum berhasil dihapus. Coba lagi.'),
            onFinish: () => setDeletingLogo(false),
        });
    };

    const discardChanges = () => {
        reset();
        clearErrors();
        clearFileInputs();
    };

    const fullAddressPreview = [
        data.address,
        data.village ? `Desa ${data.village}` : null,
        data.district ? `Kec. ${data.district}` : null,
        data.regency ? `Kab. ${data.regency}` : null,
        data.province,
        data.postal_code,
    ].filter(Boolean).join(', ');

    const renderField = (name, label, options = {}) => {
        const { hint, required, type = 'text', placeholder, normalize, maxLength, inputMode } = options;
        return (
            <Field key={name} label={label} htmlFor={name} hint={hint} required={required} error={errors[name]}>
                <Input id={name} name={name} type={type} value={data[name]} required={required}
                    onChange={(event) => setData(name, normalize ? normalize(event.target.value) : event.target.value)}
                    placeholder={placeholder} maxLength={maxLength} inputMode={inputMode}
                    aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] || hint ? `${name}-help` : undefined}
                    className={cn(inputClass, errors[name] && 'border-red-400')} />
            </Field>
        );
    };

    const saveButton = (className) => (
        <Button type="submit" form="kop-settings-form" disabled={processing || deletingLogo || !isDirty}
            className={cn('h-11 rounded-lg px-5 transition-colors active:translate-y-px motion-reduce:transform-none', className)}>
            {processing ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Save className="h-4 w-4" />}
            {processing ? 'Menyimpan...' : 'Simpan perubahan'}
        </Button>
    );

    const preview = <KopPreview data={data} logo={logoPreview} regencyLogo={regencyLogoPreview} fullAddress={fullAddressPreview} />;
    const busy = processing || deletingLogo;

    return (
        <AdminLayout header={
            <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                    <p className="mb-2 text-xs font-medium text-slate-500">SPMB <span className="mx-2 text-slate-300">/</span> Pengaturan dokumen</p>
                    <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Pengaturan KOP</h1>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">Atur identitas dan tampilan resmi formulir pendaftaran sekolah.</p>
                </div>
                <div className="hidden sm:block">{saveButton()}</div>
            </div>
        }>
            <Head title="Pengaturan KOP" />
            <div className="space-y-6">
                <nav aria-label="Bagian pengaturan KOP" className="flex flex-wrap items-center gap-2">
                    {[
                        { id: 'identitas', label: 'Identitas & logo', icon: School },
                        { id: 'alamat', label: 'Alamat & kontak', icon: MapPin },
                        { id: 'kepala-sekolah', label: 'Kepala sekolah', icon: UserCog },
                    ].map(({ id, label, icon: Icon }) => (
                        <a key={id} href={`#${id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 sm:text-[13px]">
                            <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />{label}
                            <ArrowUpRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                        </a>
                    ))}
                </nav>

                <details className="group rounded-xl border border-slate-100 bg-white xl:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
                        <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-slate-500" />Lihat pratinjau KOP</span>
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                    </summary>
                    <div className="border-t border-slate-100 p-3">{preview}</div>
                </details>

                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:gap-8">
                    <form id="kop-settings-form" onSubmit={submit} className="min-w-0 space-y-5" aria-busy={busy}>
                        <fieldset disabled={busy} className="min-w-0 space-y-5 disabled:opacity-75 [&>section:first-of-type]:!mt-0">
                            <legend className="sr-only">Identitas sekolah untuk KOP pendaftaran</legend>
                            <FormSection id="identitas" icon={School} title="Identitas & logo sekolah" description="Informasi utama yang tampil pada bagian atas formulir.">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <LogoUpload id="logo" title="Logo sekolah" position="Sisi kiri" preview={logoPreview} file={data.logo} stored={setting?.logo_path}
                                        inputRef={fileInputRef} onChange={event => setData('logo', event.target.files?.[0] ?? null)}
                                        onRemove={() => removeLogo('logo')} error={errors.logo} disabled={busy} />
                                    <LogoUpload id="regency_logo" title="Logo kabupaten / dinas" position="Sisi kanan" preview={regencyLogoPreview} file={data.regency_logo} stored={setting?.regency_logo_path}
                                        inputRef={regencyFileInputRef} onChange={event => setData('regency_logo', event.target.files?.[0] ?? null)}
                                        onRemove={() => removeLogo('regency_logo')} error={errors.regency_logo} disabled={busy} />
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">{renderField('name', 'Nama sekolah', { required: true, placeholder: 'SD Negeri 001 Kepenuhan', maxLength: 150 })}</div>
                                    {renderField('npsn', 'NPSN', { hint: 'Nomor Pokok Sekolah Nasional', inputMode: 'numeric', maxLength: 20 })}
                                    {renderField('nss', 'NSS', { hint: 'Nomor Statistik Sekolah, jika tersedia', maxLength: 20 })}
                                    {renderField('accreditation', 'Akreditasi', { placeholder: 'A / B / C', normalize: value => value.toUpperCase().slice(0, 5) })}
                                </div>
                                <div className="border-t border-slate-100/80 pt-5">
                                    <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-slate-700"><Building2 className="h-4 w-4 text-slate-500" />Instansi pada KOP</h3>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {renderField('government_regency', 'Pemerintah kabupaten / kota', { placeholder: 'Pemerintah Kabupaten Rokan Hulu' })}
                                        {renderField('education_office', 'Dinas pendidikan', { placeholder: 'Dinas Pendidikan' })}
                                    </div>
                                </div>
                            </FormSection>

                            <FormSection id="alamat" icon={MapPin} title="Alamat & kontak" description="Alamat lengkap dan kontak resmi yang dapat dihubungi.">
                                <Field label="Alamat sekolah" htmlFor="address" error={errors.address}>
                                    <Textarea id="address" name="address" rows={3} value={data.address} onChange={event => setData('address', event.target.value)}
                                        placeholder="Nama jalan dan nomor bangunan" aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? 'address-help' : undefined}
                                        className={cn('resize-y rounded-lg border-slate-100 bg-slate-50/30 text-sm placeholder:text-slate-500 focus:bg-white', errors.address && 'border-red-400')} />
                                </Field>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {renderField('village', 'Desa / kelurahan')}
                                    {renderField('district', 'Kecamatan')}
                                    {renderField('regency', 'Kabupaten / kota')}
                                    {renderField('province', 'Provinsi')}
                                    {renderField('postal_code', 'Kode pos', { inputMode: 'numeric', maxLength: 5, normalize: value => value.replace(/\D/g, '').slice(0, 5) })}
                                </div>
                                <div className="grid gap-5 border-t border-slate-100/80 pt-5 sm:grid-cols-2">
                                    {renderField('phone', 'Telepon / WhatsApp', { type: 'tel', placeholder: '08xxxxxxxxxx' })}
                                    {renderField('email', 'Email sekolah', { type: 'email', placeholder: 'sekolah@contoh.sch.id' })}
                                    <div className="sm:col-span-2">{renderField('website', 'Website', { placeholder: 'sekolah.sch.id' })}</div>
                                </div>
                            </FormSection>

                            <FormSection id="kepala-sekolah" icon={UserCog} title="Kepala sekolah & tanda tangan" description="Data penandatangan pada formulir pendaftaran.">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {renderField('principal_name', 'Nama kepala sekolah')}
                                    {renderField('principal_nip', 'NIP', { inputMode: 'numeric' })}
                                    {renderField('principal_title', 'Jabatan')}
                                    {renderField('principal_rank', 'Pangkat', { placeholder: 'Pembina' })}
                                    {renderField('principal_grade', 'Golongan', { placeholder: 'IV/a' })}
                                    {renderField('signature_city', 'Kota tanda tangan', { placeholder: data.district || 'Kepenuhan', hint: 'Dicetak bersama tanggal pada formulir' })}
                                </div>
                            </FormSection>
                        </fieldset>

                        <div className={cn('z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-[0_6px_24px_-12px_rgba(30,58,95,0.18)] lg:sticky lg:bottom-4', (isDirty || busy) && 'sticky bottom-20')}>
                            <p role="status" aria-live="polite" className={cn('flex items-center gap-2 text-xs font-medium', isDirty ? 'text-blue-700' : 'text-slate-600')}>
                                {processing ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : isDirty ? <PencilLine className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                {processing ? (progress ? `Mengunggah ${progress.percentage}%` : 'Menyimpan perubahan...') : isDirty ? 'Perubahan belum disimpan' : recentlySuccessful ? 'Perubahan berhasil disimpan' : 'Pengaturan tersimpan'}
                            </p>
                            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                                {isDirty && <Button type="button" variant="ghost" onClick={discardChanges} disabled={busy} className="h-11 rounded-lg px-3 text-xs text-slate-600">Batalkan</Button>}
                                {saveButton('flex-1 sm:flex-none')}
                            </div>
                        </div>
                    </form>

                    <aside aria-label="Pratinjau formulir pendaftaran" className="hidden min-w-0 space-y-5 xl:sticky xl:top-6 xl:block">
                        {preview}
                        <div className="flex items-start gap-3 px-1">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                            <div className="text-xs leading-relaxed text-slate-600">
                                <p className="font-semibold text-slate-700">Berlaku untuk PDF berikutnya</p>
                                <p className="mt-1">Untuk memperbarui formulir yang sudah dibuat, gunakan <span className="font-medium">Regenerate PDF</span> di detail pendaftar.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AdminLayout>
    );
}
