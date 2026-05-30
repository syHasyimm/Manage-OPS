import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Download, Loader2, RefreshCw, MessageCircle } from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

export default function Success({ registration }) {
    const { post, processing } = useForm({});

    const resend = () => {
        post(route('registration.resend-wa', { registration: registration.id }), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-600">
                        Tahun Ajaran {registration.period}
                    </p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">
                        Pendaftaran Berhasil
                    </h1>
                </div>
            }
        >
            <Head title="Pendaftaran Berhasil" />

            <div className="mx-auto max-w-2xl space-y-6">
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/20 text-gold-600">
                            <CheckCircle2 className="h-9 w-9" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-navy-950">
                                Terima kasih, {registration.student_name ?? 'Calon Murid'}!
                            </h2>
                            <p className="mt-1 text-sm text-navy-600">
                                Pendaftaran Anda telah kami terima dan sedang menunggu verifikasi admin.
                            </p>
                        </div>

                        <div className="mt-2 rounded-xl border-2 border-dashed border-gold-400 bg-gold-50 px-6 py-4">
                            <p className="text-xs uppercase tracking-widest text-navy-600">
                                Nomor Pendaftaran
                            </p>
                            <p className="mt-1 select-all text-2xl font-bold tracking-wider text-navy-900">
                                {registration.registration_number}
                            </p>
                        </div>

                        <Badge variant="secondary" className="uppercase">
                            Status: {registration.status}
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="space-y-3 py-5">
                        <p className="text-sm text-navy-700">
                            Notifikasi WhatsApp berisi konfirmasi & file PDF formulir akan
                            terkirim otomatis ke nomor terdaftar dalam beberapa menit.
                        </p>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            {registration.pdf_ready ? (
                                <Button asChild variant="default">
                                    <a href={route('registration.pdf', { registration: registration.id })} target="_blank" rel="noopener">
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </a>
                                </Button>
                            ) : (
                                <Button variant="outline" disabled>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    PDF sedang dibuat...
                                </Button>
                            )}
                            <Button variant="outline" onClick={resend} disabled={processing}>
                                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                Kirim Ulang ke WhatsApp
                            </Button>
                            <Button asChild variant="ghost">
                                <Link href={route('dashboard')}>
                                    <MessageCircle className="h-4 w-4" />
                                    Kembali ke Dashboard
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
