import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Loader2, Users } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import StepShell from '@/Components/Wizard/StepShell';
import FormField from '@/Components/Wizard/FormField';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';

function ParentForm({ role, label, data, setData, errors, options, optional = false }) {
    const value = data[role] ?? {};
    const update = (field, val) => {
        setData(role, { ...value, [field]: val });
    };

    return (
        <div className="rounded-lg border border-navy-100 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-900">
                <Users className="h-4 w-4 text-gold-600" />
                {label}
                {optional && <span className="text-xs font-normal text-navy-500">(opsional)</span>}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    label={`Nama ${label}`}
                    required={!optional}
                    htmlFor={`${role}-name`}
                    error={errors[`${role}.name`]}
                >
                    <Input
                        id={`${role}-name`}
                        value={value.name ?? ''}
                        onChange={(e) => update('name', e.target.value)}
                    />
                </FormField>
                <FormField
                    label={`NIK ${label}`}
                    htmlFor={`${role}-nik`}
                    hint="16 digit (boleh dikosongkan)"
                    error={errors[`${role}.nik`]}
                >
                    <Input
                        id={`${role}-nik`}
                        value={value.nik ?? ''}
                        onChange={(e) => update('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                    />
                </FormField>
                <FormField label="Pekerjaan" required={!optional} error={errors[`${role}.occupation`]}>
                    <Select
                        value={value.occupation ?? ''}
                        onValueChange={(v) => update('occupation', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih pekerjaan" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.occupations.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
                <FormField label="Pendidikan Terakhir" required={!optional} error={errors[`${role}.education`]}>
                    <Select
                        value={value.education ?? ''}
                        onValueChange={(v) => update('education', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih pendidikan" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.educations.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
                <FormField
                    label="Penghasilan Bulanan"
                    required={!optional}
                    error={errors[`${role}.monthly_income`]}
                    className="md:col-span-2"
                >
                    <Select
                        value={value.monthly_income ?? ''}
                        onValueChange={(v) => update('monthly_income', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih kisaran penghasilan" />
                        </SelectTrigger>
                        <SelectContent>
                            {options.incomes.map((o) => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                {role !== 'guardian' && (
                    <FormField label="Status" required error={errors[`${role}.is_alive`]} className="md:col-span-2">
                        <RadioGroup
                            value={(value.is_alive ?? true) ? 'alive' : 'deceased'}
                            onValueChange={(v) => update('is_alive', v === 'alive')}
                            className="flex flex-wrap gap-x-6 gap-y-2"
                        >
                            <label className="flex items-center gap-2 text-sm text-navy-800">
                                <RadioGroupItem value="alive" />
                                Masih Hidup
                            </label>
                            <label className="flex items-center gap-2 text-sm text-navy-800">
                                <RadioGroupItem value="deceased" />
                                Almarhum/Almarhumah
                            </label>
                        </RadioGroup>
                    </FormField>
                )}

                {role === 'guardian' && (
                    <FormField label="Nomor HP / WA Wali" htmlFor="guardian-phone" error={errors['guardian.phone']}>
                        <Input
                            id="guardian-phone"
                            inputMode="numeric"
                            value={value.phone ?? ''}
                            onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                            placeholder="081234567890"
                        />
                    </FormField>
                )}
            </div>
        </div>
    );
}

export default function Step3({ registration, options, editable }) {
    const parents = registration?.parents ?? {};
    const father = parents.father ?? {};
    const mother = parents.mother ?? {};
    const guardian = parents.guardian ?? {};

    const { data, setData, post, processing, errors } = useForm({
        contact_email: registration?.contact_email ?? '',
        has_guardian: Boolean(registration?.has_guardian),
        father: {
            name: father.name ?? '',
            nik: father.nik ?? '',
            occupation: father.occupation ?? '',
            education: father.education ?? '',
            monthly_income: father.monthly_income ?? '',
            is_alive: father.is_alive ?? true,
        },
        mother: {
            name: mother.name ?? '',
            nik: mother.nik ?? '',
            occupation: mother.occupation ?? '',
            education: mother.education ?? '',
            monthly_income: mother.monthly_income ?? '',
            is_alive: mother.is_alive ?? true,
        },
        guardian: {
            name: guardian.name ?? '',
            nik: guardian.nik ?? '',
            occupation: guardian.occupation ?? '',
            education: guardian.education ?? '',
            monthly_income: guardian.monthly_income ?? '',
            phone: guardian.phone ?? '',
            is_alive: true,
        },
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('registration.step.3.store'));
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
            <Head title="Data Orang Tua / Wali" />

            <form onSubmit={submit}>
                <StepShell
                    currentStep={3}
                    completedStep={(registration?.current_step ?? 1) - 1}
                    title="Step 3 - Data Orang Tua / Wali"
                    description="Lengkapi data Ayah, Ibu, dan opsional Wali jika ada."
                    footer={
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <Button type="button" variant="outline" asChild>
                                <a href={route('registration.step', { step: 2 })}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Sebelumnya
                                </a>
                            </Button>
                            <Button type="submit" disabled={processing || !editable}>
                                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                Simpan & Lanjut Review
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    }
                >
                    <div className="space-y-6">
                        <ParentForm
                            role="father"
                            label="Ayah Kandung"
                            data={data}
                            setData={setData}
                            errors={errors}
                            options={options}
                        />

                        <ParentForm
                            role="mother"
                            label="Ibu Kandung"
                            data={data}
                            setData={setData}
                            errors={errors}
                            options={options}
                        />

                        <div className="rounded-lg border border-navy-100 bg-navy-50/50 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-navy-900">Apakah memiliki Wali?</p>
                                    <p className="text-xs text-navy-500">
                                        Aktifkan jika anak diasuh oleh Wali (selain orang tua kandung).
                                    </p>
                                </div>
                                <Switch
                                    className="shrink-0"
                                    checked={data.has_guardian}
                                    onCheckedChange={(v) => setData('has_guardian', Boolean(v))}
                                />
                            </div>

                            {data.has_guardian && (
                                <div className="mt-4">
                                    <ParentForm
                                        role="guardian"
                                        label="Wali"
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        options={options}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border border-navy-100 bg-white p-4">
                            <h3 className="mb-3 text-sm font-semibold text-navy-900">Kontak</h3>
                            <FormField label="Email Aktif" htmlFor="contact_email" required error={errors.contact_email}>
                                <Input
                                    id="contact_email"
                                    type="email"
                                    value={data.contact_email}
                                    onChange={(e) => setData('contact_email', e.target.value)}
                                    placeholder="email@domain.com"
                                />
                            </FormField>
                        </div>
                    </div>
                </StepShell>
            </form>
        </AppLayout>
    );
}
