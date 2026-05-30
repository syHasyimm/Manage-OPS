import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => reset('password', 'password_confirmation');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout
            title="Daftar Akun Baru"
            subtitle="Buat akun untuk memulai pendaftaran murid baru"
        >
            <Head title="Daftar" />

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Nama Lengkap Pendaftar</Label>
                    <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        autoFocus
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Nama orang tua / wali"
                    />
                    {errors.name && (
                        <p className="text-xs text-red-600">{errors.name}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="phone">Nomor HP / WhatsApp</Label>
                    <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                        placeholder="081234567890"
                    />
                    <p className="text-xs text-navy-500">
                        Pastikan nomor aktif WhatsApp untuk verifikasi & notifikasi.
                    </p>
                    {errors.phone && (
                        <p className="text-xs text-red-600">{errors.phone}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
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

                <Alert variant="info" className="text-xs">
                    <AlertDescription>
                        Setelah daftar, Anda akan menerima kode OTP via WhatsApp untuk
                        verifikasi nomor.
                    </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                        href={route('login')}
                        className="text-sm text-navy-700 underline-offset-4 hover:underline"
                    >
                        Sudah punya akun?
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                        Daftar Sekarang
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
