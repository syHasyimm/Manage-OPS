import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        phone: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.phone'));
    };

    return (
        <GuestLayout
            title="Lupa Password"
            subtitle="Masukkan nomor HP terdaftar untuk menerima kode OTP via WhatsApp"
        >
            <Head title="Lupa Password" />

            {status && (
                <Alert variant="success" className="mb-4 text-xs">
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Nomor HP / WhatsApp</Label>
                    <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoFocus
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                        placeholder="081234567890"
                    />
                    {errors.phone && (
                        <p className="text-xs text-red-600">{errors.phone}</p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                        href={route('login')}
                        className="text-sm text-navy-700 underline-offset-4 hover:underline"
                    >
                        Kembali ke login
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Lanjutkan
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
