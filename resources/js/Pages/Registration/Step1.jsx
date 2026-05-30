import { Head, useForm } from '@inertiajs/react';
import { Loader2, ArrowRight } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import StepShell from '@/Components/Wizard/StepShell';
import FormField from '@/Components/Wizard/FormField';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Checkbox } from '@/Components/ui/checkbox';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';

export default function Step1({ registration, options, school, editable }) {
    const identity = registration?.identity ?? {};

    const { data, setData, post, processing, errors } = useForm({
        full_name: identity.full_name ?? '',
        gender: identity.gender ?? '',
        nik: identity.nik ?? '',
        kk_number: identity.kk_number ?? '',
        previous_kindergarten: identity.previous_kindergarten ?? '',
        birth_place: identity.birth_place ?? '',
        birth_date: identity.birth_date ?? '',
        has_special_needs: Boolean(identity.has_special_needs),
        special_needs_types: identity.special_needs_types ?? [],
        religion: identity.religion ?? '',
        dusun_name: identity.dusun_name ?? '',
        kelurahan_name: identity.kelurahan_name ?? '',
        address: identity.address ?? '',
        rt: identity.rt ?? '',
        rw: identity.rw ?? '',
        postal_code: identity.postal_code ?? '',
        residence_type: identity.residence_type ?? '',
        transportation: identity.transportation ?? '',
        child_order: identity.child_order ?? '',
        phone_wa: identity.phone_wa ?? registration?.user?.phone ?? '',
        is_kps_kph_recipient: Boolean(identity.is_kps_kph_recipient),
        has_kip: Boolean(identity.has_kip),
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('registration.step.1.store'));
    };

    const toggleSpecialNeed = (key) => {
        setData(
            'special_needs_types',
            data.special_needs_types.includes(key)
                ? data.special_needs_types.filter((v) => v !== key)
                : [...data.special_needs_types, key],
        );
    };

    return (
        <AppLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-600">
                        Tahun Ajaran {registration?.period?.academic_year}
                    </p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">
                        Formulir Pendaftaran Murid Baru
                    </h1>
                </div>
            }
        >
            <Head title="Identitas Murid" />

            <form onSubmit={submit}>
                <StepShell
                    currentStep={1}
                    completedStep={registration?.current_step - 1}
                    title="Step 1 - Identitas Murid Baru"
                    description="Lengkapi identitas calon murid sesuai Kartu Keluarga & Akta Kelahiran."
                    footer={
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-navy-500">Data otomatis tersimpan saat klik Simpan & Lanjut.</p>
                            <Button type="submit" disabled={processing || !editable}>
                                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                Simpan & Lanjut
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    }
                >
                    {/* Sekolah & Kecamatan (read-only) */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Satuan Pendidikan" htmlFor="school_name">
                            <Input id="school_name" value={school.name} disabled />
                        </FormField>
                        <FormField label="Kecamatan" htmlFor="district">
                            <Input id="district" value={school.district} disabled />
                        </FormField>
                    </div>

                    <div className="my-6 border-t border-navy-100" />

                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Nama Lengkap" htmlFor="full_name" required error={errors.full_name}>
                            <Input
                                id="full_name"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                placeholder="Sesuai Akta Kelahiran"
                            />
                        </FormField>

                        <FormField label="Jenis Kelamin" required error={errors.gender}>
                            <RadioGroup
                                value={data.gender}
                                onValueChange={(v) => setData('gender', v)}
                                className="flex gap-6"
                            >
                                {options.genders.map((g) => (
                                    <label key={g.value} className="flex items-center gap-2 text-sm text-navy-800">
                                        <RadioGroupItem value={g.value} />
                                        {g.label}
                                    </label>
                                ))}
                            </RadioGroup>
                        </FormField>

                        <FormField label="NIK" htmlFor="nik" required hint="16 digit angka" error={errors.nik}>
                            <Input
                                id="nik"
                                value={data.nik}
                                onChange={(e) => setData('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                placeholder="16 digit"
                            />
                        </FormField>

                        <FormField label="No KK" htmlFor="kk_number" required hint="16 digit angka" error={errors.kk_number}>
                            <Input
                                id="kk_number"
                                value={data.kk_number}
                                onChange={(e) => setData('kk_number', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                placeholder="16 digit"
                            />
                        </FormField>

                        <FormField label="Sekolah TK Asal" htmlFor="previous_kindergarten" hint="Boleh dikosongkan">
                            <Input
                                id="previous_kindergarten"
                                value={data.previous_kindergarten}
                                onChange={(e) => setData('previous_kindergarten', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Tempat Lahir" htmlFor="birth_place" required error={errors.birth_place}>
                            <Input
                                id="birth_place"
                                value={data.birth_place}
                                onChange={(e) => setData('birth_place', e.target.value)}
                                placeholder="Sesuai KK"
                            />
                        </FormField>

                        <FormField label="Tanggal Lahir" htmlFor="birth_date" required error={errors.birth_date}>
                            <Input
                                id="birth_date"
                                type="date"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Agama" required error={errors.religion}>
                            <Select value={data.religion} onValueChange={(v) => setData('religion', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih agama" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.religions.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>

                    <div className="mt-6 space-y-3 rounded-lg border border-navy-100 bg-navy-50/50 p-4">
                        <FormField label="Berkebutuhan Khusus?" required error={errors.has_special_needs}>
                            <RadioGroup
                                value={data.has_special_needs ? 'yes' : 'no'}
                                onValueChange={(v) => setData('has_special_needs', v === 'yes')}
                                className="flex gap-6"
                            >
                                <label className="flex items-center gap-2 text-sm text-navy-800">
                                    <RadioGroupItem value="no" />
                                    Tidak
                                </label>
                                <label className="flex items-center gap-2 text-sm text-navy-800">
                                    <RadioGroupItem value="yes" />
                                    Ya
                                </label>
                            </RadioGroup>
                        </FormField>

                        {data.has_special_needs && (
                            <div>
                                <Label className="mb-2 block">Pilih jenis (boleh lebih dari satu)</Label>
                                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                    {options.special_needs.map((s) => (
                                        <label
                                            key={s.value}
                                            className="flex items-center gap-2 rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800"
                                        >
                                            <Checkbox
                                                checked={data.special_needs_types.includes(s.value)}
                                                onCheckedChange={() => toggleSpecialNeed(s.value)}
                                            />
                                            {s.label}
                                        </label>
                                    ))}
                                </div>
                                {errors.special_needs_types && (
                                    <p className="mt-1 text-xs text-red-600">{errors.special_needs_types}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <FormField label="Nama Dusun" htmlFor="dusun_name" required error={errors.dusun_name}>
                            <Input
                                id="dusun_name"
                                value={data.dusun_name}
                                onChange={(e) => setData('dusun_name', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Nama Kelurahan / Desa" htmlFor="kelurahan_name" required error={errors.kelurahan_name}>
                            <Input
                                id="kelurahan_name"
                                value={data.kelurahan_name}
                                onChange={(e) => setData('kelurahan_name', e.target.value)}
                            />
                        </FormField>
                    </div>

                    <div className="mt-4">
                        <FormField label="Alamat Lengkap" htmlFor="address" required error={errors.address}>
                            <Textarea
                                id="address"
                                rows={3}
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Nama jalan, nomor rumah, dan rincian lokasi"
                            />
                        </FormField>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <FormField label="RT" htmlFor="rt" required error={errors.rt}>
                            <Input id="rt" value={data.rt} onChange={(e) => setData('rt', e.target.value.replace(/\D/g, '').slice(0, 4))} />
                        </FormField>
                        <FormField label="RW" htmlFor="rw" required error={errors.rw}>
                            <Input id="rw" value={data.rw} onChange={(e) => setData('rw', e.target.value.replace(/\D/g, '').slice(0, 4))} />
                        </FormField>
                        <FormField label="Kode Pos" htmlFor="postal_code" required hint="5 digit" error={errors.postal_code}>
                            <Input
                                id="postal_code"
                                value={data.postal_code}
                                onChange={(e) => setData('postal_code', e.target.value.replace(/\D/g, '').slice(0, 5))}
                            />
                        </FormField>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <FormField label="Tempat Tinggal" required error={errors.residence_type}>
                            <Select value={data.residence_type} onValueChange={(v) => setData('residence_type', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tempat tinggal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.residence_types.map((r) => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Alat Transportasi ke Sekolah" required error={errors.transportation}>
                            <Select value={data.transportation} onValueChange={(v) => setData('transportation', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih moda transportasi" />
                                </SelectTrigger>
                                <SelectContent>
                                    {options.transportations.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Anak Keberapa" htmlFor="child_order" required error={errors.child_order}>
                            <Input
                                id="child_order"
                                type="number"
                                min="1"
                                max="20"
                                value={data.child_order}
                                onChange={(e) => setData('child_order', e.target.value)}
                            />
                        </FormField>

                        <FormField label="Nomor HP / WA Murid/Wali" htmlFor="phone_wa" required hint="Untuk komunikasi sekolah" error={errors.phone_wa}>
                            <Input
                                id="phone_wa"
                                inputMode="numeric"
                                value={data.phone_wa}
                                onChange={(e) => setData('phone_wa', e.target.value.replace(/\D/g, ''))}
                            />
                        </FormField>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <FormField label="Penerima KPS / KPH?" required error={errors.is_kps_kph_recipient}>
                            <RadioGroup
                                value={data.is_kps_kph_recipient ? 'yes' : 'no'}
                                onValueChange={(v) => setData('is_kps_kph_recipient', v === 'yes')}
                                className="flex gap-6"
                            >
                                <label className="flex items-center gap-2 text-sm text-navy-800">
                                    <RadioGroupItem value="no" />
                                    Tidak
                                </label>
                                <label className="flex items-center gap-2 text-sm text-navy-800">
                                    <RadioGroupItem value="yes" />
                                    Ya
                                </label>
                            </RadioGroup>
                        </FormField>

                        <FormField label="Punya KIP?" required error={errors.has_kip}>
                            <RadioGroup
                                value={data.has_kip ? 'yes' : 'no'}
                                onValueChange={(v) => setData('has_kip', v === 'yes')}
                                className="flex gap-6"
                            >
                                <label className="flex items-center gap-2 text-sm text-navy-800">
                                    <RadioGroupItem value="no" />
                                    Tidak
                                </label>
                                <label className="flex items-center gap-2 text-sm text-navy-800">
                                    <RadioGroupItem value="yes" />
                                    Ya
                                </label>
                            </RadioGroup>
                        </FormField>
                    </div>
                </StepShell>
            </form>
        </AppLayout>
    );
}
