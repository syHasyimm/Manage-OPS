import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    CheckCircle2,
    Info,
    KeyRound,
    Loader2,
    Save,
    Send,
    Smartphone,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
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

export default function Edit({ driver, base_url, token_configured, token_hint, device }) {
    const { flash } = usePage().props;
    const settingsForm = useForm({
        fonnte_token: '',
        fonnte_device: device ?? '',
    });
    const testForm = useForm({
        phone: '',
    });

    useEffect(() => {
        if (flash?.status) toast.success(flash.status);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.status, flash?.error]);

    const submitSettings = (event) => {
        event.preventDefault();
        settingsForm.patch(route('admin.whatsapp-settings.update'), {
            preserveScroll: true,
            onSuccess: () => settingsForm.setData('fonnte_token', ''),
            onError: () => toast.error('Gagal menyimpan. Periksa kembali isian.'),
        });
    };

    const submitTest = (event) => {
        event.preventDefault();
        testForm.post(route('admin.whatsapp-settings.test'), {
            preserveScroll: true,
            onError: () => toast.error('Nomor tujuan tidak valid.'),
        });
    };

    const isLogDriver = driver !== 'fonnte';

    return (
        <AdminLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Admin</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Pengaturan WhatsApp</h1>
                    <p className="mt-1 text-xs text-navy-500">
                        Atur kredensial Fonnte untuk notifikasi OTP, pendaftaran, dan perubahan status.
                    </p>
                </div>
            }
        >
            <Head title="Pengaturan WhatsApp" />

            <div className="space-y-4">
                {isLogDriver && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                            Driver saat ini <strong>log</strong>, jadi pesan tidak dikirim ke WhatsApp. Pesan hanya ditulis ke log aplikasi.
                            Ubah <code className="rounded bg-amber-100 px-1">WHATSAPP_DRIVER=fonnte</code> di .env untuk mengaktifkan pengiriman nyata.
                        </p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <KeyRound className="h-4 w-4" />
                            Kredensial Fonnte
                        </CardTitle>
                        <CardDescription>
                            Token disimpan terenkripsi. Nilai token kosong saat disimpan akan mempertahankan token yang sudah ada.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitSettings} className="space-y-4">
                            <Field
                                label="Fonnte Token"
                                htmlFor="fonnte_token"
                                error={settingsForm.errors.fonnte_token}
                                hint={token_configured ? `Token aktif: ${token_hint}` : 'Belum ada token tersimpan. Token dari .env tetap digunakan sebagai fallback.'}
                            >
                                <Input
                                    id="fonnte_token"
                                    type="password"
                                    value={settingsForm.data.fonnte_token}
                                    onChange={(event) => settingsForm.setData('fonnte_token', event.target.value)}
                                    placeholder={token_configured ? 'Kosongkan untuk mempertahankan token aktif' : 'Masukkan token Fonnte'}
                                    autoComplete="new-password"
                                />
                            </Field>

                            <Field
                                label="Fonnte Device (Referensi)"
                                htmlFor="fonnte_device"
                                error={settingsForm.errors.fonnte_device}
                                hint="Opsional. Disimpan sebagai referensi device. Endpoint kirim Fonnte mengikat device melalui token."
                            >
                                <Input
                                    id="fonnte_device"
                                    value={settingsForm.data.fonnte_device}
                                    onChange={(event) => settingsForm.setData('fonnte_device', event.target.value)}
                                    placeholder="ID device Fonnte (opsional)"
                                />
                            </Field>

                            <div className="flex flex-col justify-between gap-3 border-t border-navy-100 pt-4 sm:flex-row sm:items-center">
                                <p className="text-xs text-navy-500">
                                    Driver: <strong className="text-navy-700">{driver}</strong> · Endpoint: <strong className="text-navy-700">{base_url}</strong>
                                </p>
                                <Button type="submit" disabled={settingsForm.processing}>
                                    {settingsForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Simpan Pengaturan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Smartphone className="h-4 w-4" />
                            Kirim Pesan Uji
                        </CardTitle>
                        <CardDescription>
                            Kirim pesan singkat ke nomor admin untuk memastikan kredensial dan koneksi gateway berfungsi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitTest} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="min-w-0 flex-1">
                                <Field
                                    label="Nomor WhatsApp Tujuan"
                                    htmlFor="phone"
                                    error={testForm.errors.phone}
                                    hint="Contoh: 081234567890 atau 6281234567890"
                                    required
                                >
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={testForm.data.phone}
                                        onChange={(event) => testForm.setData('phone', event.target.value)}
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </Field>
                            </div>
                            <Button type="submit" variant="secondary" disabled={testForm.processing}>
                                {testForm.processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Kirim Pesan Uji
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        Perubahan kredensial berlaku untuk request baru dan job queue berikutnya. Queue worker tidak perlu direstart setelah token diubah.
                    </p>
                </div>
            </div>
        </AdminLayout>
    );
}
