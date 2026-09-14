import { Head, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    AlertTriangle,
    CalendarDays,
    FileText,
    Loader2,
    MapPin,
    Plus,
    Printer,
    Trash2,
    Users,
    WalletCards,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { toast } from 'sonner';

function FieldError({ message }) {
    if (!message) return null;

    return <p className="text-xs text-red-600">{message}</p>;
}

function Field({ label, htmlFor, hint, error, required, children }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={htmlFor}>
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-xs leading-relaxed text-navy-500">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}

const emptyTraveler = () => ({
    staff_id: '',
    salary: '',
    travel_level: '',
});

const emptyFollower = () => ({
    name: '',
    age: '',
    relationship: '',
});

export default function Create({ staff = [], principal, defaults }) {
    const { data, setData, post, processing, errors } = useForm({
        letter_number: '',
        travelers: [emptyTraveler()],
        purpose: '',
        transportation: 'Kendaraan darat',
        departure_place: defaults?.departure_place ?? '',
        destination: '',
        departure_date: '',
        return_date: '',
        followers: [],
        agency: defaults?.agency ?? '',
        budget_account: '',
        other_notes: '',
        issue_place: defaults?.issue_place ?? '',
        issue_date: defaults?.issue_date ?? '',
    });

    const staffById = useMemo(
        () => new Map(staff.map((employee) => [String(employee.id), employee])),
        [staff],
    );

    const duration = useMemo(() => {
        if (!data.departure_date || !data.return_date) return null;

        const start = new Date(`${data.departure_date}T00:00:00`);
        const end = new Date(`${data.return_date}T00:00:00`);
        const days = Math.round((end - start) / 86400000) + 1;

        return days > 0 ? days : null;
    }, [data.departure_date, data.return_date]);

    const updateTraveler = (index, field, value) => {
        setData('travelers', data.travelers.map((traveler, travelerIndex) => (
            travelerIndex === index ? { ...traveler, [field]: value } : traveler
        )));
    };

    const updateFollower = (index, field, value) => {
        setData('followers', data.followers.map((follower, followerIndex) => (
            followerIndex === index ? { ...follower, [field]: value } : follower
        )));
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.sppd.store'), {
            preserveScroll: true,
            onSuccess: () => window.location.assign(route('admin.sppd.download')),
            onError: () => toast.error('SPPD belum dapat dibuat. Periksa kembali isian.'),
        });
    };

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Administrasi perjalanan dinas</p>
                    <h1 className="mt-1 text-xl font-semibold tracking-tight text-navy-950">Template SPPD</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-navy-500">
                        Susun Surat Perintah Perjalanan Dinas dua halaman menggunakan profil sekolah dan data guru/tendik.
                    </p>
                </div>
            }
        >
            <Head title="Template SPPD" />

            <form onSubmit={submit} className="space-y-4">
                {(!principal?.name || !principal?.nip || !principal?.rank || !principal?.grade) && (
                    <Alert className="border-amber-200 bg-amber-50 text-amber-950">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Data penandatangan belum lengkap</AlertTitle>
                        <AlertDescription>
                            Nama, NIP, pangkat, atau golongan Kepala Sekolah masih kosong. Lengkapi di{' '}
                            <a href={route('admin.school-settings.edit')} className="font-semibold underline underline-offset-2">
                                Profil Sekolah
                            </a>
                            {' '}agar blok tanda tangan SPPD terisi penuh.
                        </AlertDescription>
                    </Alert>
                )}

                {staff.length === 0 && (
                    <Alert className="border-red-200 bg-red-50 text-red-950">
                        <Users className="h-4 w-4" />
                        <AlertTitle>Data pegawai belum tersedia</AlertTitle>
                        <AlertDescription>
                            Tambahkan guru atau tenaga kependidikan di menu Data Guru & Tendik sebelum membuat SPPD.
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4" />
                            Identitas surat
                        </CardTitle>
                        <CardDescription>Nomor dicetak tepat di bawah judul SPPD.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Field label="Nomor SPPD" htmlFor="letter_number" error={errors.letter_number} required>
                            <Input
                                id="letter_number"
                                value={data.letter_number}
                                onChange={(event) => setData('letter_number', event.target.value)}
                                placeholder="400.3.5.3/012-SPPD/SD/2026"
                                required
                            />
                        </Field>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="h-4 w-4" />
                                    Pegawai yang diperintahkan
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Identitas kepegawaian diambil langsung dari master guru/tendik.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setData('travelers', [...data.travelers, emptyTraveler()])}
                                disabled={data.travelers.length >= 2 || staff.length === 0}
                            >
                                <Plus className="h-4 w-4" />
                                Tambah pegawai
                            </Button>
                        </div>
                        <FieldError message={errors.travelers} />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {data.travelers.map((traveler, index) => {
                            const employee = staffById.get(String(traveler.staff_id));

                            return (
                                <section key={index} className="rounded-xl border border-navy-100 bg-navy-50/50 p-4">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold text-navy-900">Pegawai {index + 1}</p>
                                        {data.travelers.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => setData(
                                                    'travelers',
                                                    data.travelers.filter((_, travelerIndex) => travelerIndex !== index),
                                                )}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Hapus
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field
                                            label="Pilih guru/tendik"
                                            htmlFor={`traveler-${index}-staff`}
                                            error={errors[`travelers.${index}.staff_id`]}
                                            required
                                        >
                                            <select
                                                id={`traveler-${index}-staff`}
                                                value={traveler.staff_id}
                                                onChange={(event) => updateTraveler(index, 'staff_id', event.target.value)}
                                                className="flex h-10 w-full rounded-md border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                                                required
                                            >
                                                <option value="">Pilih pegawai</option>
                                                {staff.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                        disabled={data.travelers.some((candidate, candidateIndex) => (
                                                            candidateIndex !== index && String(candidate.staff_id) === String(item.id)
                                                        ))}
                                                    >
                                                        {item.name}{item.nip ? ` — ${item.nip}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field
                                            label="Gaji pokok"
                                            htmlFor={`traveler-${index}-salary`}
                                            error={errors[`travelers.${index}.salary`]}
                                            hint="Opsional; isi sesuai dokumen kepegawaian terbaru."
                                        >
                                            <Input
                                                id={`traveler-${index}-salary`}
                                                value={traveler.salary}
                                                onChange={(event) => updateTraveler(index, 'salary', event.target.value)}
                                                placeholder="Rp4.250.000"
                                            />
                                        </Field>
                                        <Field
                                            label="Tingkat perjalanan dinas"
                                            htmlFor={`traveler-${index}-travel-level`}
                                            error={errors[`travelers.${index}.travel_level`]}
                                            hint="Opsional; mengikuti peraturan perjalanan dinas yang berlaku."
                                        >
                                            <Input
                                                id={`traveler-${index}-travel-level`}
                                                value={traveler.travel_level}
                                                onChange={(event) => updateTraveler(index, 'travel_level', event.target.value)}
                                                placeholder="Tingkat C"
                                            />
                                        </Field>
                                        <div className="rounded-lg bg-white p-3 text-xs leading-relaxed text-navy-600 md:self-end">
                                            {employee ? (
                                                <>
                                                    <p className="font-semibold text-navy-900">{employee.position || 'Jabatan belum diisi'}</p>
                                                    <p className="mt-1">Pangkat/Gol.: {[employee.rank, employee.grade].filter(Boolean).join(' / ') || '-'}</p>
                                                </>
                                            ) : (
                                                <p>Rincian jabatan, pangkat, dan golongan akan tampil setelah pegawai dipilih.</p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MapPin className="h-4 w-4" />
                            Rencana perjalanan
                        </CardTitle>
                        <CardDescription>Rincian utama keberangkatan dan tujuan dinas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Field label="Maksud perjalanan dinas" htmlFor="purpose" error={errors.purpose} required>
                            <Textarea
                                id="purpose"
                                value={data.purpose}
                                onChange={(event) => setData('purpose', event.target.value)}
                                placeholder="Mengikuti rapat koordinasi ..."
                                rows={3}
                                required
                            />
                        </Field>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Field label="Alat angkut" htmlFor="transportation" error={errors.transportation} required>
                                <Input
                                    id="transportation"
                                    value={data.transportation}
                                    onChange={(event) => setData('transportation', event.target.value)}
                                    required
                                />
                            </Field>
                            <Field label="Tempat berangkat" htmlFor="departure_place" error={errors.departure_place} required>
                                <Input
                                    id="departure_place"
                                    value={data.departure_place}
                                    onChange={(event) => setData('departure_place', event.target.value)}
                                    required
                                />
                            </Field>
                            <Field label="Tempat tujuan" htmlFor="destination" error={errors.destination} required>
                                <Input
                                    id="destination"
                                    value={data.destination}
                                    onChange={(event) => setData('destination', event.target.value)}
                                    placeholder="Dinas Pendidikan Kabupaten ..."
                                    required
                                />
                            </Field>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Tanggal berangkat" htmlFor="departure_date" error={errors.departure_date} required>
                                <Input
                                    id="departure_date"
                                    type="date"
                                    value={data.departure_date}
                                    onChange={(event) => setData('departure_date', event.target.value)}
                                    required
                                />
                            </Field>
                            <Field
                                label="Tanggal kembali"
                                htmlFor="return_date"
                                error={errors.return_date}
                                hint={duration ? `Lama perjalanan: ${duration} hari` : 'Tidak boleh sebelum tanggal berangkat.'}
                                required
                            >
                                <Input
                                    id="return_date"
                                    type="date"
                                    min={data.departure_date || undefined}
                                    value={data.return_date}
                                    onChange={(event) => setData('return_date', event.target.value)}
                                    required
                                />
                            </Field>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <CardTitle className="text-base">Pengikut</CardTitle>
                                <CardDescription className="mt-1">Bagian opsional untuk keluarga atau pendamping perjalanan.</CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setData('followers', [...data.followers, emptyFollower()])}
                                disabled={data.followers.length >= 10}
                            >
                                <Plus className="h-4 w-4" />
                                Tambah pengikut
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {data.followers.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-navy-200 px-4 py-6 text-center text-sm text-navy-500">
                                Tidak ada pengikut. Bagian ini akan dicetak kosong untuk pengisian manual bila diperlukan.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.followers.map((follower, index) => (
                                    <div key={index} className="grid gap-3 rounded-xl border border-navy-100 bg-navy-50/50 p-4 md:grid-cols-[1fr_8rem_1fr_auto]">
                                        <Field label="Nama" htmlFor={`follower-${index}-name`} error={errors[`followers.${index}.name`]}>
                                            <Input
                                                id={`follower-${index}-name`}
                                                value={follower.name}
                                                onChange={(event) => updateFollower(index, 'name', event.target.value)}
                                            />
                                        </Field>
                                        <Field label="Umur" htmlFor={`follower-${index}-age`} error={errors[`followers.${index}.age`]}>
                                            <Input
                                                id={`follower-${index}-age`}
                                                type="number"
                                                min="0"
                                                max="120"
                                                value={follower.age}
                                                onChange={(event) => updateFollower(index, 'age', event.target.value)}
                                            />
                                        </Field>
                                        <Field label="Hubungan/keterangan" htmlFor={`follower-${index}-relationship`} error={errors[`followers.${index}.relationship`]}>
                                            <Input
                                                id={`follower-${index}-relationship`}
                                                value={follower.relationship}
                                                onChange={(event) => updateFollower(index, 'relationship', event.target.value)}
                                            />
                                        </Field>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mt-6 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            aria-label={`Hapus pengikut ${index + 1}`}
                                            onClick={() => setData('followers', data.followers.filter((_, followerIndex) => followerIndex !== index))}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <WalletCards className="h-4 w-4" />
                            Pembebanan anggaran
                        </CardTitle>
                        <CardDescription>Instansi dan mata anggaran yang membiayai perjalanan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Instansi" htmlFor="agency" error={errors.agency} required>
                                <Input id="agency" value={data.agency} onChange={(event) => setData('agency', event.target.value)} required />
                            </Field>
                            <Field label="Mata anggaran" htmlFor="budget_account" error={errors.budget_account} required>
                                <Input
                                    id="budget_account"
                                    value={data.budget_account}
                                    onChange={(event) => setData('budget_account', event.target.value)}
                                    placeholder="BOS Reguler / kode rekening"
                                    required
                                />
                            </Field>
                        </div>
                        <Field label="Keterangan lain-lain" htmlFor="other_notes" error={errors.other_notes}>
                            <Textarea
                                id="other_notes"
                                value={data.other_notes}
                                onChange={(event) => setData('other_notes', event.target.value)}
                                placeholder="Opsional"
                                rows={2}
                            />
                        </Field>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarDays className="h-4 w-4" />
                            Penerbitan SPPD
                        </CardTitle>
                        <CardDescription>Tempat dan tanggal pada blok tanda tangan halaman pertama.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <Field label="Dikeluarkan di" htmlFor="issue_place" error={errors.issue_place} required>
                            <Input id="issue_place" value={data.issue_place} onChange={(event) => setData('issue_place', event.target.value)} required />
                        </Field>
                        <Field label="Pada tanggal" htmlFor="issue_date" error={errors.issue_date} required>
                            <Input id="issue_date" type="date" value={data.issue_date} onChange={(event) => setData('issue_date', event.target.value)} required />
                        </Field>
                    </CardContent>
                </Card>

                <div className="sticky bottom-20 z-10 flex justify-end rounded-xl border border-navy-100 bg-white/95 p-3 shadow-lg backdrop-blur lg:bottom-4">
                    <Button type="submit" disabled={processing || staff.length === 0}>
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                        Buat & unduh PDF
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
