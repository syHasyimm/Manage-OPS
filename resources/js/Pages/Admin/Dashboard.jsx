import { Head } from '@inertiajs/react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from 'recharts';
import {
    CheckCircle2,
    FileText,
    UserCheck,
    Users,
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';

const COLORS = ['#1E3A5F', '#C9A84C', '#486581', '#a17a2a', '#9fb3c8'];

function StatList({ data, valueKey = 'total', labelKey = 'label' }) {
    if (!data?.length) {
        return <p className="py-4 text-center text-sm text-navy-500">Belum ada data.</p>;
    }
    const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0)) || 1;
    return (
        <ul className="space-y-2">
            {data.map((item, idx) => {
                const value = Number(item[valueKey]) || 0;
                const pct = Math.round((value / max) * 100);
                return (
                    <li key={idx} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 flex-1 truncate text-navy-700">{item[labelKey]}</span>
                            <span className="font-semibold text-navy-900">{value}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-100">
                            <div
                                className="h-full rounded-full bg-navy-700"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

function StatCard({ icon: Icon, label, value, hint }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 py-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                    <Icon className="h-5 w-5" />
                </span>
                <div>
                    <p className="text-xs uppercase tracking-wide text-navy-500">{label}</p>
                    <p className="text-2xl font-semibold text-navy-950">{value}</p>
                    {hint && <p className="text-xs text-navy-500">{hint}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard({ period, stats, status_counts, gender_counts, religion_counts, dusun_top }) {
    const statusList = [
        { key: 'draft', label: 'Draft' },
        { key: 'submitted', label: 'Terkirim' },
        { key: 'verified', label: 'Terverifikasi' },
        { key: 'accepted', label: 'Diterima' },
        { key: 'rejected', label: 'Ditolak' },
        { key: 'need_revision', label: 'Perlu Revisi' },
    ];

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gold-700">Admin</p>
                        <h1 className="mt-1 text-xl font-semibold text-navy-950">Dashboard</h1>
                    </div>
                    {period && (
                        <Badge variant="secondary" className="bg-gold-500 text-navy-950">
                            Periode {period.academic_year}
                        </Badge>
                    )}
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            {!period && (
                <Alert variant="warning" className="mb-6">
                    <AlertDescription>
                        Belum ada periode pendaftaran aktif. Aktifkan periode dari menu Periode.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} label="Total User" value={stats.total_users} />
                <StatCard icon={FileText} label="Pendaftaran" value={stats.total_registrations} hint="Termasuk draft" />
                <StatCard icon={UserCheck} label="Tersubmit" value={stats.total_submitted} />
                <StatCard icon={CheckCircle2} label="Diterima" value={stats.total_accepted} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Distribusi Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {statusList.map((s) => (
                                <div key={s.key} className="rounded-lg border border-navy-100 bg-navy-50 px-3 py-3 text-center">
                                    <p className="text-xs uppercase text-navy-500">{s.label}</p>
                                    <p className="mt-1 text-xl font-semibold text-navy-950">
                                        {status_counts?.[s.key] ?? 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Jenis Kelamin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="md:hidden">
                            <StatList data={gender_counts} />
                        </div>
                        <div className="hidden md:block" style={{ height: 240 }}>
                            {gender_counts?.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={gender_counts}
                                            dataKey="total"
                                            nameKey="label"
                                            innerRadius={50}
                                            outerRadius={80}
                                        >
                                            {gender_counts.map((entry, idx) => (
                                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-sm text-navy-500">Belum ada data.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Distribusi Agama</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="md:hidden">
                            <StatList data={religion_counts} />
                        </div>
                        <div className="hidden md:block" style={{ height: 280 }}>
                            {religion_counts?.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={religion_counts}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#bcccdc" />
                                        <XAxis dataKey="label" stroke="#486581" fontSize={11} />
                                        <YAxis stroke="#486581" fontSize={11} allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="total" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-sm text-navy-500">Belum ada data.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">5 Dusun Terbanyak</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="md:hidden">
                            <StatList data={dusun_top} />
                        </div>
                        <div className="hidden md:block" style={{ height: 280 }}>
                            {dusun_top?.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dusun_top} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#bcccdc" />
                                        <XAxis type="number" stroke="#486581" fontSize={11} allowDecimals={false} />
                                        <YAxis type="category" dataKey="label" stroke="#486581" fontSize={11} width={120} />
                                        <Tooltip />
                                        <Bar dataKey="total" fill="#C9A84C" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-sm text-navy-500">Belum ada data.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
