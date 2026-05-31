import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    CheckCircle2,
    Download,
    Loader2,
    MessageCircle,
    PencilLine,
    Send,
    XCircle,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';

const STATUS = {
    draft: { label: 'Draft', variant: 'warning' },
    submitted: { label: 'Terkirim', variant: 'default' },
    verified: { label: 'Terverifikasi', variant: 'secondary' },
    accepted: { label: 'Diterima', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
    need_revision: { label: 'Perlu Revisi', variant: 'warning' },
};

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

function Section({ title, children }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <dl className="divide-y divide-navy-100">{children}</dl>
            </CardContent>
        </Card>
    );
}

function NoteDialog({ open, onOpenChange, title, action, registrationId, urlName }) {
    const { data, setData, post, processing, reset } = useForm({ note: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route(urlName, { registration: registrationId }), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            Catatan akan dikirim ke pendaftar via WhatsApp.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="my-4">
                        <Textarea
                            rows={4}
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder="Tulis alasan / instruksi revisi..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing || !data.note.trim()}>
                            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                            {action}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Show({ registration, options, school }) {
    const meta = STATUS[registration.status] ?? STATUS.draft;
    const [openReject, setOpenReject] = useState(false);
    const [openRevision, setOpenRevision] = useState(false);
    const verifyForm = useForm({});
    const acceptForm = useForm({});

    const verify = () => verifyForm.post(route('admin.registrations.verify', { registration: registration.id }), { preserveScroll: true });
    const accept = () => acceptForm.post(route('admin.registrations.accept', { registration: registration.id }), { preserveScroll: true });

    const i = registration.identity ?? {};
    const p = registration.periodic ?? {};
    const father = registration.parents?.find((x) => x.role === 'father');
    const mother = registration.parents?.find((x) => x.role === 'mother');
    const guardian = registration.parents?.find((x) => x.role === 'guardian');

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <Button asChild variant="ghost" size="sm" className="shrink-0">
                            <Link href={route('admin.registrations.index')}>
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-widest text-gold-700">Detail Pendaftaran</p>
                            <h1 className="mt-1 break-words text-lg font-semibold text-navy-950 sm:text-xl">
                                {i?.full_name ?? '-'}
                            </h1>
                        </div>
                    </div>
                    <Badge variant={meta.variant} className="self-start uppercase sm:self-auto">{meta.label}</Badge>
                </div>
            }
        >
            <Head title={`Detail - ${registration.registration_number ?? registration.id}`} />

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardContent className="space-y-3 py-5 text-sm">
                        <div>
                            <p className="text-xs uppercase text-navy-500">Nomor Pendaftaran</p>
                            <p className="select-all font-mono text-base text-navy-950">{registration.registration_number ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-navy-500">Pendaftar</p>
                            <p className="font-medium text-navy-950">{registration.user?.name}</p>
                            <p className="text-navy-500">{registration.user?.phone}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-navy-500">Submitted</p>
                            <p>{registration.submitted_at ? new Date(registration.submitted_at).toLocaleString('id-ID') : '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-navy-500">Verified</p>
                            <p>{registration.verified_at ? new Date(registration.verified_at).toLocaleString('id-ID') : '-'}</p>
                        </div>
                        {registration.admin_note && (
                            <div className="rounded-md bg-amber-50 px-3 py-2 text-amber-900">
                                <p className="text-xs uppercase">Catatan Admin</p>
                                <p>{registration.admin_note}</p>
                            </div>
                        )}

                        {registration.pdf_path && (
                            <Button asChild variant="outline" className="w-full">
                                <a href={route('registration.pdf', { registration: registration.id })} target="_blank" rel="noopener">
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </a>
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4 lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Aksi Admin</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            <Button onClick={verify} variant="outline" disabled={verifyForm.processing || registration.status !== 'submitted'}>
                                <CheckCircle2 className="h-4 w-4" />
                                Verifikasi
                            </Button>
                            <Button onClick={accept} disabled={acceptForm.processing || !['submitted','verified'].includes(registration.status)}>
                                <Send className="h-4 w-4" />
                                Terima
                            </Button>
                            <Button variant="destructive" onClick={() => setOpenReject(true)} disabled={['accepted','rejected'].includes(registration.status)}>
                                <XCircle className="h-4 w-4" />
                                Tolak
                            </Button>
                            <Button variant="secondary" onClick={() => setOpenRevision(true)} disabled={['accepted','rejected'].includes(registration.status)}>
                                <PencilLine className="h-4 w-4" />
                                Minta Revisi
                            </Button>
                            <Button asChild variant="ghost">
                                <Link href={route('registration.resend-wa', { registration: registration.id })} method="post" as="button" preserveScroll>
                                    <MessageCircle className="h-4 w-4" />
                                    Kirim Ulang WA
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Section title="Identitas Murid">
                        <Row label="Satuan Pendidikan" value={i.school_name ?? school.name} />
                        <Row label="Nama Lengkap" value={i.full_name} />
                        <Row label="Jenis Kelamin" value={i.gender === 'L' ? 'Laki-Laki' : 'Perempuan'} />
                        <Row label="NIK" value={i.nik} />
                        <Row label="No KK" value={i.kk_number} />
                        <Row label="Tempat / Tgl Lahir" value={`${i.birth_place ?? '-'} / ${i.birth_date ?? '-'}`} />
                        <Row label="Sekolah TK Asal" value={i.previous_kindergarten} />
                        <Row label="Agama" value={findLabel(options.religions, i.religion)} />
                        <Row label="Berkebutuhan Khusus" value={i.has_special_needs ? (i.special_needs_types ?? []).map((t) => findLabel(options.special_needs, t)).join(', ') : 'Tidak'} />
                        <Row label="Alamat" value={i.address} />
                        <Row label="Dusun / Kelurahan" value={`${i.dusun_name ?? '-'} / ${i.kelurahan_name ?? '-'}`} />
                        <Row label="RT/RW Kode Pos" value={`${i.rt ?? '-'}/${i.rw ?? '-'} ${i.postal_code ?? ''}`} />
                        <Row label="Tempat Tinggal" value={findLabel(options.residence_types, i.residence_type)} />
                        <Row label="Transportasi" value={findLabel(options.transportations, i.transportation)} />
                        <Row label="Anak Keberapa" value={i.child_order} />
                        <Row label="No HP / WA" value={i.phone_wa} />
                        <Row label="KPS / KPH" value={i.is_kps_kph_recipient ? 'Ya' : 'Tidak'} />
                        <Row label="KIP" value={i.has_kip ? 'Ya' : 'Tidak'} />
                    </Section>

                    <Section title="Data Periodik">
                        <Row label="Tinggi" value={p.height_cm ? `${p.height_cm} cm` : null} />
                        <Row label="Berat" value={p.weight_kg ? `${p.weight_kg} kg` : null} />
                        <Row label="Hobi" value={p.hobby} />
                        <Row label="Cita-Cita" value={p.aspiration} />
                        <Row label="Akta Lahir" value={p.birth_certificate_number} />
                        <Row label="Jarak ke Sekolah" value={p.distance_category === '>1km' ? `>1km (${p.distance_km} km)` : findLabel(options.distance_categories, p.distance_category)} />
                        <Row label="Waktu Tempuh" value={p.travel_time_minutes ? `${p.travel_time_minutes} menit` : null} />
                        <Row label="Saudara" value={p.siblings_count} />
                    </Section>

                    <Section title="Orang Tua / Wali">
                        <Row label="Email Kontak" value={registration.contact_email} />
                        <Row label="Memiliki Wali" value={registration.has_guardian ? 'Ya' : 'Tidak'} />

                        <Row label="--- Ayah ---" value="" />
                        <Row label="Nama Ayah" value={father?.name} />
                        <Row label="NIK Ayah" value={father?.nik} />
                        <Row label="Pekerjaan Ayah" value={findLabel(options.occupations, father?.occupation)} />
                        <Row label="Pendidikan Ayah" value={findLabel(options.educations, father?.education)} />
                        <Row label="Penghasilan Ayah" value={findLabel(options.incomes, father?.monthly_income)} />

                        <Row label="--- Ibu ---" value="" />
                        <Row label="Nama Ibu" value={mother?.name} />
                        <Row label="NIK Ibu" value={mother?.nik} />
                        <Row label="Pekerjaan Ibu" value={findLabel(options.occupations, mother?.occupation)} />
                        <Row label="Pendidikan Ibu" value={findLabel(options.educations, mother?.education)} />
                        <Row label="Penghasilan Ibu" value={findLabel(options.incomes, mother?.monthly_income)} />

                        {guardian && (
                            <>
                                <Row label="--- Wali ---" value="" />
                                <Row label="Nama Wali" value={guardian.name} />
                                <Row label="NIK Wali" value={guardian.nik} />
                                <Row label="Pekerjaan Wali" value={findLabel(options.occupations, guardian.occupation)} />
                                <Row label="HP / WA Wali" value={guardian.phone} />
                            </>
                        )}
                    </Section>
                </div>
            </div>

            <NoteDialog
                open={openReject}
                onOpenChange={setOpenReject}
                title="Tolak Pendaftaran"
                action="Tolak"
                registrationId={registration.id}
                urlName="admin.registrations.reject"
            />
            <NoteDialog
                open={openRevision}
                onOpenChange={setOpenRevision}
                title="Minta Revisi"
                action="Kirim Permintaan"
                registrationId={registration.id}
                urlName="admin.registrations.request-revision"
            />
        </AdminLayout>
    );
}
