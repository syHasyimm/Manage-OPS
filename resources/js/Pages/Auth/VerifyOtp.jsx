import { useEffect, useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Loader2, MessageCircle } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function VerifyOtp({ phone, status }) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });
    const [cooldown, setCooldown] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (cooldown <= 0) return;
        intervalRef.current = setInterval(() => {
            setCooldown((c) => Math.max(0, c - 1));
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [cooldown]);

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.verify'));
    };

    const resend = () => {
        if (cooldown > 0) return;
        post(route('verification.send'), {
            preserveScroll: true,
            onSuccess: () => setCooldown(60),
        });
    };

    return (
        <GuestLayout
            title="Verifikasi Nomor WhatsApp"
            subtitle={
                phone
                    ? `Kode OTP telah dikirim ke ${phone}`
                    : 'Masukkan kode OTP yang dikirim via WhatsApp'
            }
        >
            <Head title="Verifikasi OTP" />

            {status && (
                <Alert variant="info" className="mb-4 text-xs">
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="code">Kode OTP (6 digit)</Label>
                    <Input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        autoFocus
                        maxLength={6}
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="text-center text-2xl tracking-[0.5em]"
                    />
                    {errors.code && (
                        <p className="text-xs text-red-600">{errors.code}</p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={processing || data.code.length !== 6}>
                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verifikasi
                </Button>

                <div className="flex items-center justify-between text-xs text-navy-500">
                    <span className="flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        Tidak menerima kode?
                    </span>
                    <button
                        type="button"
                        onClick={resend}
                        disabled={cooldown > 0}
                        className="font-medium text-navy-800 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-navy-300"
                    >
                        {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim ulang'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
