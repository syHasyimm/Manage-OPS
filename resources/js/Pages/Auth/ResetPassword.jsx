import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function ResetPassword({ phone, status }) {
    const { data, setData, post, processing, errors } = useForm({
        phone: phone ?? '',
        code: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.update.via-otp'));
    };

    return (
        <GuestLayout
            title="Atur Password Baru"
            subtitle="Masukkan kode OTP yang dikirim via WhatsApp dan password baru"
        >
            <Head title="Reset Password" />

            {status && (
                <Alert variant="info" className="mb-4 text-xs">
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Nomor HP</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                        readOnly={Boolean(phone)}
                    />
                    {errors.phone && (
                        <p className="text-xs text-red-600">{errors.phone}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="code">Kode OTP (6 digit)</Label>
                    <Input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="tracking-widest text-center text-lg"
                    />
                    {errors.code && (
                        <p className="text-xs text-red-600">{errors.code}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password Baru</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && (
                        <p className="text-xs text-red-600">{errors.password}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password_confirmation">Ulangi Password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={processing}>
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Simpan Password
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
