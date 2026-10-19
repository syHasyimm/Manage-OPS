import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Reveal } from '@/Components/Motion';

export default function Edit({ phoneVerified, status }) {
    return (
        <AppLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-amber-700">Akun</p>
                    <h1 className="mt-1 text-xl font-semibold text-slate-950">Profil</h1>
                </div>
            }
        >
            <Head title="Profil" />

            <div className="space-y-4 sm:space-y-6">
                <Reveal className="rounded-lg bg-white p-4 shadow sm:p-8">
                    <UpdateProfileInformationForm
                        phoneVerified={phoneVerified}
                        status={status}
                        className="max-w-xl"
                    />
                </Reveal>

                <Reveal delay={0.06} className="rounded-lg bg-white p-4 shadow sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </Reveal>

                <Reveal delay={0.12} className="rounded-lg bg-white p-4 shadow sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </Reveal>
            </div>
        </AppLayout>
    );
}
