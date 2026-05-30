import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout
            title="Masuk Akun"
            subtitle="Lanjutkan pendaftaran murid baru"
        >
            <Head title="Login" />

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
                        autoComplete="tel"
                        autoFocus
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                        placeholder="081234567890"
                    />
                    {errors.phone && (
                        <p className="text-xs text-red-600">{errors.phone}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    {errors.password && (
                        <p className="text-xs text-red-600">{errors.password}</p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-navy-700">
                        <Checkbox
                            checked={data.remember}
                            onCheckedChange={(value) => setData('remember', Boolean(value))}
                        />
                        Ingat saya
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-navy-700 underline-offset-4 hover:underline"
                        >
                            Lupa password?
                        </Link>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                        href={route('register')}
                        className="text-sm text-navy-700 underline-offset-4 hover:underline"
                    >
                        Belum punya akun?
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Masuk
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
