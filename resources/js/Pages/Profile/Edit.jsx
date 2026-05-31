import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ phoneVerified, status }) {
    return (
        <AppLayout
            header={
                <div>
                    <p className="text-xs uppercase tracking-widest text-gold-700">Akun</p>
                    <h1 className="mt-1 text-xl font-semibold text-navy-950">Profil</h1>
                </div>
            }
        >
            <Head title="Profil" />

            <div className="space-y-4 sm:space-y-6">
                <div className="rounded-lg bg-white p-4 shadow sm:p-8">
                    <UpdateProfileInformationForm
                        phoneVerified={phoneVerified}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-lg bg-white p-4 shadow sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="rounded-lg bg-white p-4 shadow sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AppLayout>
    );
}
