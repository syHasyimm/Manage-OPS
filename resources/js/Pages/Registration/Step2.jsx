import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import StepShell from '@/Components/Wizard/StepShell';
import FormField from '@/Components/Wizard/FormField';
import { Input } from '@/Components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Button } from '@/Components/ui/button';

export default function Step2({ registration, options, editable }) {
    const periodic = registration?.periodic ?? {};

    const { data, setData, post, processing, errors } = useForm({
        height_cm: periodic.height_cm ?? '',
        weight_kg: periodic.weight_kg ?? '',
        hobby: periodic.hobby ?? '',
        aspiration: periodic.aspiration ?? '',
        birth_certificate_number: periodic.birth_certificate_number ?? '',
        distance_category: periodic.distance_category ?? '<1km',
        distance_km: periodic.distance_km ?? '',
        travel_time_minutes: periodic.travel_time_minutes ?? '',
        siblings_count: periodic.siblings_count ?? 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('registration.step.2.store'));
    };

    const goBack = () => {
        window.history.length > 1 ? window.history.back() : null;
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
            <Head title="Data Periodik" />

            <form onSubmit={submit}>
                <StepShell
                    currentStep={2}
                    completedStep={(registration?.current_step ?? 1) - 1}
                    title="Step 2 - Data Periodik"
                    description="Data periodik calon murid sebagai pelengkap data Dapodik."
                    footer={
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <Button type="button" variant="outline" asChild>
                                <a href={route('registration.step', { step: 1 })}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Sebelumnya
                                </a>
                            </Button>
                            <Button type="submit" disabled={processing || !editable}>
                                {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                Simpan & Lanjut
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    }
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Tinggi Badan (cm)" htmlFor="height_cm" required error={errors.height_cm}>
                            <Input
                                id="height_cm"
                                type="number"
                                min="50"
                                max="200"
                                value={data.height_cm}
                                onChange={(e) => setData('height_cm', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Berat Badan (kg)" htmlFor="weight_kg" required error={errors.weight_kg}>
                            <Input
                                id="weight_kg"
                                type="number"
                                min="5"
                                max="100"
                                value={data.weight_kg}
                                onChange={(e) => setData('weight_kg', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Hobi" htmlFor="hobby" error={errors.hobby}>
                            <Input id="hobby" value={data.hobby} onChange={(e) => setData('hobby', e.target.value)} />
                        </FormField>
                        <FormField label="Cita-Cita" htmlFor="aspiration" error={errors.aspiration}>
                            <Input
                                id="aspiration"
                                value={data.aspiration}
                                onChange={(e) => setData('aspiration', e.target.value)}
                            />
                        </FormField>
                        <FormField
                            label="No Registrasi Akta Lahir"
                            htmlFor="birth_certificate_number"
                            error={errors.birth_certificate_number}
                            className="md:col-span-2"
                        >
                            <Input
                                id="birth_certificate_number"
                                value={data.birth_certificate_number}
                                onChange={(e) => setData('birth_certificate_number', e.target.value)}
                            />
                        </FormField>
                    </div>

                    <div className="mt-6 rounded-lg border border-navy-100 bg-navy-50/50 p-4">
                        <FormField label="Jarak Tempat Tinggal ke Sekolah" required error={errors.distance_category}>
                            <RadioGroup
                                value={data.distance_category}
                                onValueChange={(v) => {
                                    setData('distance_category', v);
                                    if (v === '<1km') setData('distance_km', '');
                                }}
                                className="flex flex-col gap-2 sm:flex-row sm:gap-6"
                            >
                                {options.distance_categories.map((d) => (
                                    <label key={d.value} className="flex items-center gap-2 text-sm text-navy-800">
                                        <RadioGroupItem value={d.value} />
                                        {d.label}
                                    </label>
                                ))}
                            </RadioGroup>
                        </FormField>

                        {data.distance_category === '>1km' && (
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <FormField label="Berapa kilometer?" htmlFor="distance_km" required error={errors.distance_km}>
                                    <Input
                                        id="distance_km"
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        value={data.distance_km}
                                        onChange={(e) => setData('distance_km', e.target.value)}
                                    />
                                </FormField>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <FormField label="Waktu Tempuh ke Sekolah (menit)" htmlFor="travel_time_minutes" error={errors.travel_time_minutes}>
                            <Input
                                id="travel_time_minutes"
                                type="number"
                                min="1"
                                max="300"
                                value={data.travel_time_minutes}
                                onChange={(e) => setData('travel_time_minutes', e.target.value)}
                            />
                        </FormField>
                        <FormField label="Jumlah Saudara Kandung" htmlFor="siblings_count" required error={errors.siblings_count}>
                            <Input
                                id="siblings_count"
                                type="number"
                                min="0"
                                max="30"
                                value={data.siblings_count}
                                onChange={(e) => setData('siblings_count', e.target.value)}
                            />
                        </FormField>
                    </div>
                </StepShell>
            </form>
        </AppLayout>
    );
}
