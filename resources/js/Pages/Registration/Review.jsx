import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Pencil, Send, Loader2 } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import Stepper from '@/Components/Wizard/Stepper';

function findLabel(list, value) {
    return list?.find((o) => o.value === value)?.label ?? value ?? '-';
}

function Row({ label, value }) {
    return (
        <div className="grid grid-cols-1 gap-1 border-b border-navy-100 py-2 text-sm sm:grid-cols-3">
            <dt className="font-medium text-navy-600">{label}</dt>
            <dd className="break-words text-navy-950 sm:col-span-2">{value || <span className="text-navy-400">-</span>}</dd>
        </div>
    );
}

function Section({ title, action, children }) {
    return (
        <Card>
            <CardHeader className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <CardTitle className="text-base">{title}</CardTitle>
                {action}
            </CardHeader>
            <CardContent>
                <dl className="divide-y divide-navy-100">{children}</dl>
            </CardContent>
        </Card>
    );
}

export default function Review({ registration, options, school, editable }) {
    const identity = registration?.identity ?? {};
    const periodic = registration?.periodic ?? {};
    const father = registration?.parents?.find((p) => p.role === 'father') ?? null;
    const mother = registration?.parents?.find((p) => p.role === 'mother') ?? null;
    const guardian = registration?.parents?.find((p) => p.role === 'guardian') ?? null;

    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('registration.submit'));
    };

    const editLink = (step) => (
        editable ? (
            <Button asChild variant="outline" size="sm">
                <Link href={route('registration.step', { step })}>
                    <Pencil className="h-3.5 w-3.5" />
                    Ubah
                </Link>
            </Button>
        ) : null
    );

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-widest text-gold-600">
                            Tahun Ajaran {registration?.period?.academic_year}
                        </p>
                        <h1 className="mt-1 break-words text-lg font-semibold text-navy-950 sm:text-xl">
                            Review & Submit Pendaftaran
                        </h1>
                    </div>
                    <Badge variant="outline" className="self-start sm:self-auto">Status: {registration.status}</Badge>
                </div>
            }
        >
            <Head title="Review Pendaftaran" />

            <div className="space-y-6">
                <Card>
                    <CardContent className="py-5">
                        <Stepper current={3} completed={3} />
                    </CardContent>
                </Card>

                <Section title="Step 1 - Identitas Murid" action={editLink(1)}>
                    <Row label="Satuan Pendidikan" value={school.name} />
                    <Row label="Kecamatan" value={school.district} />
                    <Row label="Nama Lengkap" value={identity.full_name} />
                    <Row label="Jenis Kelamin" value={findLabel(options.genders, identity.gender)} />
                    <Row label="NIK" value={identity.nik} />
                    <Row label="No KK" value={identity.kk_number} />
                    <Row label="Sekolah TK Asal" value={identity.previous_kindergarten} />
                    <Row label="Tempat / Tanggal Lahir" value={`${identity.birth_place ?? '-'} / ${identity.birth_date ?? '-'}`} />
                    <Row
                        label="Berkebutuhan Khusus"
                        value={
                            identity.has_special_needs
                                ? (identity.special_needs_types ?? []).map((t) => findLabel(options.special_needs, t)).join(', ')
                                : 'Tidak'
                        }
                    />
                    <Row label="Agama" value={findLabel(options.religions, identity.religion)} />
                    <Row label="Dusun" value={identity.dusun_name} />
                    <Row label="Kelurahan/Desa" value={identity.kelurahan_name} />
                    <Row label="Alamat" value={identity.address} />
                    <Row label="RT / RW" value={`${identity.rt ?? '-'} / ${identity.rw ?? '-'}`} />
                    <Row label="Kode Pos" value={identity.postal_code} />
                    <Row label="Tempat Tinggal" value={findLabel(options.residence_types, identity.residence_type)} />
                    <Row label="Transportasi" value={findLabel(options.transportations, identity.transportation)} />
                    <Row label="Anak Keberapa" value={identity.child_order} />
                    <Row label="Nomor HP / WA" value={identity.phone_wa} />
                    <Row label="Penerima KPS / KPH" value={identity.is_kps_kph_recipient ? 'Ya' : 'Tidak'} />
                    <Row label="Punya KIP" value={identity.has_kip ? 'Ya' : 'Tidak'} />
                </Section>

                <Section title="Step 2 - Data Periodik" action={editLink(2)}>
                    <Row label="Tinggi Badan" value={periodic.height_cm ? `${periodic.height_cm} cm` : null} />
                    <Row label="Berat Badan" value={periodic.weight_kg ? `${periodic.weight_kg} kg` : null} />
                    <Row label="Hobi" value={periodic.hobby} />
                    <Row label="Cita-Cita" value={periodic.aspiration} />
                    <Row label="No Akta Lahir" value={periodic.birth_certificate_number} />
                    <Row
                        label="Jarak ke Sekolah"
                        value={
                            periodic.distance_category === '>1km'
                                ? `Lebih dari 1 km (${periodic.distance_km ?? '-'} km)`
                                : findLabel(options.distance_categories, periodic.distance_category)
                        }
                    />
                    <Row label="Waktu Tempuh" value={periodic.travel_time_minutes ? `${periodic.travel_time_minutes} menit` : null} />
                    <Row label="Saudara Kandung" value={periodic.siblings_count} />
                </Section>

                <Section title="Step 3 - Data Orang Tua / Wali" action={editLink(3)}>
                    <Row label="Email Kontak" value={registration.contact_email} />
                    <Row label="Memiliki Wali" value={registration.has_guardian ? 'Ya' : 'Tidak'} />

                    <Row label="--- Ayah ---" value="" />
                    <Row label="Nama Ayah" value={father?.name} />
                    <Row label="NIK Ayah" value={father?.nik} />
                    <Row label="Pekerjaan Ayah" value={findLabel(options.occupations, father?.occupation)} />
                    <Row label="Pendidikan Ayah" value={findLabel(options.educations, father?.education)} />
                    <Row label="Penghasilan Ayah" value={findLabel(options.incomes, father?.monthly_income)} />
                    <Row label="Status Ayah" value={father?.is_alive ? 'Masih Hidup' : 'Almarhum'} />

                    <Row label="--- Ibu ---" value="" />
                    <Row label="Nama Ibu" value={mother?.name} />
                    <Row label="NIK Ibu" value={mother?.nik} />
                    <Row label="Pekerjaan Ibu" value={findLabel(options.occupations, mother?.occupation)} />
                    <Row label="Pendidikan Ibu" value={findLabel(options.educations, mother?.education)} />
                    <Row label="Penghasilan Ibu" value={findLabel(options.incomes, mother?.monthly_income)} />
                    <Row label="Status Ibu" value={mother?.is_alive ? 'Masih Hidup' : 'Almarhumah'} />

                    {registration.has_guardian && (
                        <>
                            <Row label="--- Wali ---" value="" />
                            <Row label="Nama Wali" value={guardian?.name} />
                            <Row label="NIK Wali" value={guardian?.nik} />
                            <Row label="Pekerjaan Wali" value={findLabel(options.occupations, guardian?.occupation)} />
                            <Row label="Pendidikan Wali" value={findLabel(options.educations, guardian?.education)} />
                            <Row label="Penghasilan Wali" value={findLabel(options.incomes, guardian?.monthly_income)} />
                            <Row label="HP / WA Wali" value={guardian?.phone} />
                        </>
                    )}
                </Section>

                <form onSubmit={submit}>
                    <Card>
                        <CardContent className="flex flex-col items-start gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-1 h-5 w-5 text-gold-600" />
                                <div>
                                    <p className="text-sm font-medium text-navy-900">
                                        Pastikan semua data sudah benar.
                                    </p>
                                    <p className="text-xs text-navy-500">
                                        Setelah submit, data tidak dapat diubah kecuali admin meminta revisi.
                                    </p>
                                </div>
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:flex-wrap">
                                <Button asChild variant="outline" className="w-full sm:w-auto">
                                    <Link href={route('registration.step', { step: 3 })}>
                                        <ArrowLeft className="h-4 w-4" />
                                        Kembali
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing || !editable} className="w-full sm:w-auto">
                                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <Send className="h-4 w-4" />
                                    Submit Pendaftaran
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
