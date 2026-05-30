import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Download,
    GraduationCap,
    Loader2,
    Search,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';

const STATUS_LABEL = {
    draft: { label: 'Draft', variant: 'warning' },
    submitted: { label: 'Terkirim', variant: 'default' },
    verified: { label: 'Terverifikasi', variant: 'secondary' },
    accepted: { label: 'Diterima', variant: 'success' },
    rejected: { label: 'Ditolak', variant: 'destructive' },
    need_revision: { label: 'Perlu Revisi', variant: 'warning' },
};

export default function PublicStatus({ prefill, result }) {
    const { school } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        phone: prefill?.phone ?? '',
        registration_number: prefill?.no ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('public-status.check'), {
            preserveScroll: true,
        });
    };

    const meta = result ? STATUS_LABEL[result.status] ?? STATUS_LABEL.draft : null;

    return (
        <div className="min-h-screen bg-navy-50 text-navy-900">
            <Head title="Cek Status Pendaftaran" />

            <header className="border-b border-navy-100 bg-white">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                            <GraduationCap className="h-5 w-5" />
                        </span>
                        <div className="leading-tight">
                            <p className="text-[10px] uppercase tracking-widest text-gold-700">SPMB</p>
                            <p className="text-sm font-semibold text-navy-950">{school?.name}</p>
                        </div>
                    </Link>
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4" />
                            Beranda
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="mb-6 text-center">
                    <Badge variant="secondary" className="bg-gold-500 text-navy-950">
                        Public Status Tracker
                    </Badge>
                    <h1 className="mt-3 text-2xl font-semibold text-navy-950">
                        Cek Status Pendaftaran
                    </h1>
                    <p className="mt-1 text-sm text-navy-600">
                        Masukkan nomor HP terdaftar dan nomor pendaftaran untuk melihat status terkini.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pencarian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="phone">Nomor HP / WA</Label>
                                <Input
                                    id="phone"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                                    placeholder="081234567890"
                                />
                                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="registration_number">Nomor Pendaftaran</Label>
                                <Input
                                    id="registration_number"
                                    value={data.registration_number}
                                    onChange={(e) => setData('registration_number', e.target.value.toUpperCase())}
                                    placeholder="SPMB-2026-0001"
                                />
                                {errors.registration_number && (
                                    <p className="text-xs text-red-600">{errors.registration_number}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2 sm:flex sm:justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    Cek Status
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {result && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-base">Hasil</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant={meta?.variant} className="uppercase">
                                    {meta?.label ?? result.status}
                                </Badge>
                                <span className="text-sm font-mono tracking-wider text-gold-700">
                                    {result.registration_number}
                                </span>
                            </div>
                            <dl className="divide-y divide-navy-100 text-sm">
                                <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3">
                                    <dt className="font-medium text-navy-600">Nama Murid</dt>
                                    <dd className="sm:col-span-2">{result.student_name ?? '-'}</dd>
                                </div>
                                <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3">
                                    <dt className="font-medium text-navy-600">Tahun Ajaran</dt>
                                    <dd className="sm:col-span-2">{result.period}</dd>
                                </div>
                                <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3">
                                    <dt className="font-medium text-navy-600">Submitted</dt>
                                    <dd className="sm:col-span-2">
                                        {result.submitted_at
                                            ? new Date(result.submitted_at).toLocaleString('id-ID')
                                            : '-'}
                                    </dd>
                                </div>
                                <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3">
                                    <dt className="font-medium text-navy-600">Diverifikasi</dt>
                                    <dd className="sm:col-span-2">
                                        {result.verified_at
                                            ? new Date(result.verified_at).toLocaleString('id-ID')
                                            : 'Belum'}
                                    </dd>
                                </div>
                            </dl>

                            {result.admin_note && (
                                <Alert variant="info">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Catatan Admin</AlertTitle>
                                    <AlertDescription>{result.admin_note}</AlertDescription>
                                </Alert>
                            )}

                            {result.pdf_url && (
                                <Button asChild variant="outline">
                                    <a href={result.pdf_url} target="_blank" rel="noopener">
                                        <Download className="h-4 w-4" />
                                        Download PDF Formulir
                                    </a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
