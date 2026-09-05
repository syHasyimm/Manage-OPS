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
    TrendingUp,
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
        <ul className="space-y-4">
            {data.map((item, idx) => {
                const value = Number(item[valueKey]) || 0;
                const pct = Math.round((value / max) * 100);
                return (
                    <li key={idx} className="group relative">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 flex-1 truncate font-medium text-navy-700 transition-colors group-hover:text-navy-950">{item[labelKey]}</span>
                            <span className="font-semibold text-navy-900">{value}</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-navy-500 to-navy-800 transition-all duration-700 ease-out"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

function StatCard({ icon: Icon, label, value, hint, colorClass = "text-gold-700 bg-gold-500/15" }) {
    return (
        <Card className="group relative overflow-hidden border-navy-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            {/* Subtle decorative background circle */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-navy-50 to-transparent transition-transform duration-500 group-hover:scale-150 opacity-50" />
            
            <CardContent className="relative flex items-center gap-4 p-6">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${colorClass} transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                    <Icon className="h-6 w-6" />
                </span>
                <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-navy-400">{label}</p>
                    <div className="mt-1 flex items-baseline gap-2">
                        <p className="text-3xl font-extrabold tracking-tight text-navy-950">{value}</p>
                    </div>
                    {hint && <p className="mt-1 text-xs text-navy-400 font-medium">{hint}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard({ period, stats, status_counts, gender_counts, religion_counts, dusun_top }) {
    const statusList = [
        { key: 'draft', label: 'Draft', color: 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm' },
        { key: 'submitted', label: 'Terkirim', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm' },
        { key: 'verified', label: 'Terverifikasi', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-sm' },
        { key: 'accepted', label: 'Diterima', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-sm' },
        { key: 'rejected', label: 'Ditolak', color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 hover:shadow-sm' },
        { key: 'need_revision', label: 'Perlu Revisi', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300 hover:shadow-sm' },
    ];

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">Admin Panel</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy-950">Dashboard Ikhtisar</h1>
                    </div>
                    {period && (
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-gold-100 text-gold-900 border border-gold-200 shadow-sm">
                            Periode {period.academic_year}
                        </Badge>
                    )}
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            {!period && (
                <Alert variant="warning" className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                    <AlertDescription className="font-medium">
                        Belum ada periode pendaftaran aktif. Silakan aktifkan periode terlebih dahulu dari menu Periode.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
                <StatCard 
                    icon={Users} 
                    label="Total Pengguna" 
                    value={stats.total_users} 
                    colorClass="text-blue-600 bg-blue-100" 
                />
                <StatCard 
                    icon={FileText} 
                    label="Total Pendaftaran" 
                    value={stats.total_registrations} 
                    hint="Termasuk status draft" 
                    colorClass="text-gold-700 bg-gold-100" 
                />
                <StatCard 
                    icon={UserCheck} 
                    label="Siap Diproses" 
                    value={stats.total_submitted} 
                    hint="Status Terkirim & Revisi"
                    colorClass="text-indigo-600 bg-indigo-100" 
                />
                <StatCard 
                    icon={CheckCircle2} 
                    label="Siswa Diterima" 
                    value={stats.total_accepted} 
                    colorClass="text-emerald-600 bg-emerald-100" 
                />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
                <Card className="border-navy-100 shadow-sm">
                    <CardHeader className="border-b border-navy-50/50 bg-navy-50/20 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base font-bold text-navy-900">
                            <TrendingUp className="h-4 w-4 text-navy-500" />
                            Distribusi Status Pendaftaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {statusList.map((s) => (
                                <div key={s.key} className={`group flex flex-col justify-center rounded-xl border p-4 text-center transition-all duration-300 ${s.color}`}>
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">{s.label}</p>
                                    <p className="mt-2 text-3xl font-extrabold tracking-tight transition-transform duration-300 group-hover:scale-105">
                                        {status_counts?.[s.key] ?? 0}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-navy-100 shadow-sm">
                    <CardHeader className="border-b border-navy-50/50 bg-navy-50/20 pb-4">
                        <CardTitle className="text-base font-bold text-navy-900">Komposisi Jenis Kelamin</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="md:hidden">
                            <StatList data={gender_counts} />
                        </div>
                        <div className="hidden md:block" style={{ height: 260 }}>
                            {gender_counts?.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={gender_counts}
                                            dataKey="total"
                                            nameKey="label"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={3}
                                        >
                                            {gender_counts.map((entry, idx) => (
                                                <Cell key={idx} fill={COLORS[idx % COLORS.length]} className="stroke-white stroke-2 transition-all duration-300 hover:opacity-80" />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontWeight: 600, color: '#1E3A5F' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-navy-400">Belum ada data pendaftar.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-navy-100 shadow-sm">
                    <CardHeader className="border-b border-navy-50/50 bg-navy-50/20 pb-4">
                        <CardTitle className="text-base font-bold text-navy-900">Distribusi Agama</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="md:hidden">
                            <StatList data={religion_counts} />
                        </div>
                        <div className="hidden md:block" style={{ height: 300 }}>
                            {religion_counts?.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={religion_counts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="total" fill="#1E3A5F" radius={[6, 6, 0, 0]} className="transition-all duration-300 hover:opacity-80" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-navy-400">Belum ada data pendaftar.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-navy-100 shadow-sm">
                    <CardHeader className="border-b border-navy-50/50 bg-navy-50/20 pb-4">
                        <CardTitle className="text-base font-bold text-navy-900">5 Dusun Terbanyak</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="md:hidden">
                            <StatList data={dusun_top} />
                        </div>
                        <div className="hidden md:block" style={{ height: 300 }}>
                            {dusun_top?.length ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dusun_top} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" stroke="#94a3b8" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                                        <YAxis type="category" dataKey="label" stroke="#486581" fontSize={12} width={130} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="total" fill="#C9A84C" radius={[0, 6, 6, 0]} className="transition-all duration-300 hover:opacity-80" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-sm text-navy-400">Belum ada data pendaftar.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
