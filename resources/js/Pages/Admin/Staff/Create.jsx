import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/Components/ui/button';
import Form from './Form';

export default function Create() {
    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Manage SDM</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Tambah Data</h1>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={route('admin.staff.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>
            }
        >
            <Head title="Admin - Tambah Guru & Tendik" />

            <div className="mx-auto max-w-2xl">
                <Form />
            </div>
        </AdminLayout>
    );
}
