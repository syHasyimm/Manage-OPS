import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function UpdateProfileInformation({
    phoneVerified,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            phone: user.phone,
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-navy-900">
                    Informasi Profil
                </h2>

                <p className="mt-1 text-sm text-navy-600">
                    Perbarui nama dan nomor HP/WA akun Anda. Mengubah nomor akan mereset status verifikasi.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="Nomor HP / WhatsApp" />

                    <TextInput
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        className="mt-1 block w-full"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                        required
                        autoComplete="tel"
                    />

                    <InputError className="mt-2" message={errors.phone} />
                </div>

                {phoneVerified === false && (
                    <div>
                        <p className="mt-2 text-sm text-navy-800">
                            Nomor HP Anda belum terverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 rounded-md text-sm text-navy-700 underline hover:text-navy-900"
                            >
                                Klik untuk kirim ulang OTP via WhatsApp.
                            </Link>
                        </p>

                        {status && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Simpan</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-navy-600">Tersimpan.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
