import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { 
    Loader2, 
    Plus, 
    Calendar as CalendarIcon, 
    Trash2, 
    CalendarDays, 
    GraduationCap, 
    CalendarOff, 
    Sparkles, 
    Clock, 
    Filter, 
    Check, 
    X, 
    ChevronRight, 
    Info, 
    Users, 
    BookOpen, 
    Tag, 
    Bookmark,
    CalendarRange,
    CheckCircle2,
    FileText
} from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
import { toast } from 'sonner';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import idLocale from '@fullcalendar/core/locales/id';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-xs font-medium text-red-600">{message}</p>;
}

function StatCard({ icon: Icon, label, value, hint, colorClass = "text-navy-700 bg-navy-50" }) {
    return (
        <Card className="group relative overflow-hidden border-navy-100/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-navy-50/60 to-transparent transition-transform duration-500 group-hover:scale-125 opacity-70" />
            <CardContent className="relative flex items-center gap-4 p-5">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colorClass} transition-all duration-300 group-hover:scale-105 shadow-xs`}>
                    <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-navy-400 truncate">{label}</p>
                    <p className="text-2xl font-extrabold tracking-tight text-navy-950 mt-0.5">{value ?? 0}</p>
                    {hint && <p className="mt-0.5 text-xs text-navy-500 font-medium truncate">{hint}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

function formatDateRange(startStr, endStr) {
    if (!startStr) return '';
    try {
        const s = new Date(startStr);
        const e = endStr ? new Date(endStr) : s;
        
        const startFormatted = s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        
        if (startStr === endStr || !endStr) {
            return s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        
        if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
            return `${s.getDate()} - ${e.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
        
        return `${startFormatted} - ${e.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } catch {
        return `${startStr} - ${endStr || ''}`;
    }
}

function getDateBadge(dateStr) {
    if (!dateStr) return { day: '', month: '' };
    try {
        const d = new Date(dateStr);
        return {
            day: d.getDate(),
            month: d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase(),
        };
    } catch {
        return { day: '', month: '' };
    }
}

export default function Index({ 
    categories = [], 
    category_colors = {}, 
    upcoming_events = [], 
    stats = {}, 
    active_academic_year = '' 
}) {
    const calendarRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        title: '',
        category: '',
        start_date: '',
        end_date: '',
        academic_year: active_academic_year || '',
        semester: 'Ganjil',
        description: '',
        target_audience: 'Semua',
    });

    // Refetch FullCalendar events when selectedCategory changes
    useEffect(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().refetchEvents();
        }
    }, [selectedCategory]);

    const openAddModal = (startStr, endStr) => {
        clearErrors();
        setModalMode('add');
        setSelectedEventId(null);
        reset();
        
        const today = new Date().toISOString().split('T')[0];
        setData({
            title: '',
            category: selectedCategory !== 'all' ? selectedCategory : (categories[0] || 'Hari Efektif Belajar'),
            start_date: startStr || today,
            end_date: endStr || startStr || today,
            academic_year: active_academic_year || '',
            semester: 'Ganjil',
            description: '',
            target_audience: 'Semua',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (info) => {
        const ev = info.event;
        clearErrors();
        setModalMode('edit');
        setSelectedEventId(ev.id);
        
        setData({
            title: ev.title,
            category: ev.extendedProps.category || '',
            start_date: ev.startStr.split('T')[0],
            end_date: ev.extendedProps.original_end_date || ev.startStr.split('T')[0],
            academic_year: ev.extendedProps.academic_year || '',
            semester: ev.extendedProps.semester || 'Ganjil',
            description: ev.extendedProps.description || '',
            target_audience: ev.extendedProps.target_audience || 'Semua',
        });
        
        setIsModalOpen(true);
    };

    const openEditFromUpcoming = (item) => {
        clearErrors();
        setModalMode('edit');
        setSelectedEventId(item.id);
        setData({
            title: item.title,
            category: item.category || '',
            start_date: item.start_date,
            end_date: item.end_date,
            academic_year: item.academic_year || '',
            semester: item.semester || 'Ganjil',
            description: item.description || '',
            target_audience: item.target_audience || 'Semua',
        });
        setIsModalOpen(true);
    };

    const handleDateSelect = (selectInfo) => {
        const start = selectInfo.startStr;
        // In FullCalendar, selectInfo.end is exclusive. 
        // End date should be inclusive in our form:
        const end = new Date(selectInfo.end);
        end.setDate(end.getDate() - 1);
        const endStr = end.toISOString().split('T')[0];
        
        openAddModal(start, endStr);
    };

    const handleEventClick = (clickInfo) => {
        openEditModal(clickInfo);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (modalMode === 'add') {
            post(route('admin.academic-calendars.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Agenda berhasil ditambahkan.');
                    calendarRef.current?.getApi().refetchEvents();
                }
            });
        } else {
            put(route('admin.academic-calendars.update', { academic_calendar: selectedEventId }), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    toast.success('Agenda berhasil diperbarui.');
                    calendarRef.current?.getApi().refetchEvents();
                }
            });
        }
    };

    const handleDelete = () => {
        if (!confirm('Anda yakin ingin menghapus agenda ini?')) return;
        
        destroy(route('admin.academic-calendars.destroy', { academic_calendar: selectedEventId }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                toast.success('Agenda berhasil dihapus.');
                calendarRef.current?.getApi().refetchEvents();
            }
        });
    };

    const fetchEvents = (fetchInfo, successCallback, failureCallback) => {
        const url = new URL(route('admin.academic-calendars.index'), window.location.origin);
        url.searchParams.set('start', fetchInfo.startStr);
        url.searchParams.set('end', fetchInfo.endStr);
        if (selectedCategory && selectedCategory !== 'all') {
            url.searchParams.set('category', selectedCategory);
        }
        
        fetch(url.toString(), {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(res => res.json())
        .then(eventsData => successCallback(eventsData))
        .catch(err => failureCallback(err));
    };

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Manage OPS</span>
                            {active_academic_year && (
                                <Badge variant="secondary" className="bg-gold-100/80 text-gold-900 border border-gold-200/80 text-[11px] font-semibold px-2 py-0.5">
                                    T.A. {active_academic_year}
                                </Badge>
                            )}
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-navy-950">
                            Kalender Pendidikan
                        </h1>
                        <p className="text-xs text-navy-600 mt-0.5">
                            Kelola jadwal akademik, hari efektif KBM, hari libur nasional, dan agenda kegiatan sekolah.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                        <Button 
                            onClick={() => openAddModal(null, null)}
                            className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm hover:shadow transition-all duration-200"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Tambah Agenda
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Kalender Pendidikan" />

            <div className="space-y-6">
                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard 
                        icon={CalendarDays} 
                        label="Total Agenda" 
                        value={stats?.total ?? 0}
                        hint="Seluruh agenda tersimpan"
                        colorClass="text-navy-900 bg-navy-100"
                    />
                    <StatCard 
                        icon={GraduationCap} 
                        label="Kegiatan Akademik" 
                        value={stats?.academic ?? 0}
                        hint="UTS, UAS, Ujian & Rapor"
                        colorClass="text-emerald-700 bg-emerald-50"
                    />
                    <StatCard 
                        icon={CalendarOff} 
                        label="Hari Libur & Cuti" 
                        value={stats?.holidays ?? 0}
                        hint="Nasional, semester, cuti"
                        colorClass="text-red-700 bg-red-50"
                    />
                    <StatCard 
                        icon={Sparkles} 
                        label="Agenda Bulan Ini" 
                        value={stats?.this_month ?? 0}
                        hint="Kegiatan bulan berjalan"
                        colorClass="text-gold-700 bg-gold-50"
                    />
                </div>

                {/* Main Content Layout */}
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Left Sidebar Widgets */}
                    <div className="lg:col-span-1 space-y-5">
                        {/* Category Filter & Legend */}
                        <Card className="border-navy-100/80 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="p-4 pb-3 border-b border-navy-50 bg-slate-50/40">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-navy-600" />
                                        <CardTitle className="text-sm font-bold text-navy-950">Kategori Agenda</CardTitle>
                                    </div>
                                    {selectedCategory !== 'all' && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategory('all')}
                                            className="text-[11px] font-medium text-navy-500 hover:text-navy-800 flex items-center gap-1 transition-colors"
                                        >
                                            <X className="h-3 w-3" /> Reset
                                        </button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCategory('all')}
                                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                                            selectedCategory === 'all'
                                                ? 'bg-navy-900 text-white font-semibold shadow-xs'
                                                : 'text-navy-700 hover:bg-navy-50/80'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full border border-current opacity-70" />
                                            <span>Semua Kategori</span>
                                        </div>
                                        {selectedCategory === 'all' && <Check className="h-3.5 w-3.5" />}
                                    </button>

                                    {categories.map(cat => {
                                        const color = category_colors[cat] || '#2563eb';
                                        const isSelected = selectedCategory === cat;
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                                                    isSelected
                                                        ? 'bg-navy-50 text-navy-950 font-bold ring-1 ring-navy-200 shadow-xs'
                                                        : 'text-navy-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate">
                                                    <span 
                                                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                                                        style={{ backgroundColor: color }}
                                                    />
                                                    <span className="truncate">{cat}</span>
                                                </div>
                                                {isSelected && (
                                                    <span 
                                                        className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Upcoming Events Widget */}
                        <Card className="border-navy-100/80 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="p-4 pb-3 border-b border-navy-50 bg-slate-50/40">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-navy-600" />
                                        <CardTitle className="text-sm font-bold text-navy-950">Agenda Terdekat</CardTitle>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-navy-500 border-navy-200">
                                        {upcoming_events.length} Terjadwal
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3">
                                {upcoming_events && upcoming_events.length > 0 ? (
                                    <div className="space-y-2.5">
                                        {upcoming_events.map(ev => {
                                            const badge = getDateBadge(ev.start_date);
                                            const dateRange = formatDateRange(ev.start_date, ev.end_date);
                                            const color = ev.color || category_colors[ev.category] || '#2563eb';
                                            return (
                                                <div 
                                                    key={ev.id}
                                                    onClick={() => openEditFromUpcoming(ev)}
                                                    className="group relative flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-navy-200 bg-slate-50/50 hover:bg-white hover:shadow-sm cursor-pointer transition-all duration-200"
                                                >
                                                    {/* Date Chip */}
                                                    <div 
                                                        className="flex flex-col items-center justify-center shrink-0 w-11 h-12 rounded-lg bg-white shadow-xs border text-center transition-transform group-hover:scale-105"
                                                        style={{ borderTop: `3px solid ${color}` }}
                                                    >
                                                        <span className="text-[9px] font-bold tracking-tighter text-slate-400 leading-none">
                                                            {badge.month}
                                                        </span>
                                                        <span className="text-sm font-extrabold text-navy-950 leading-tight">
                                                            {badge.day}
                                                        </span>
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-semibold text-navy-950 truncate group-hover:text-gold-700 transition-colors">
                                                            {ev.title}
                                                        </h4>
                                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                                            {dateRange}
                                                        </p>
                                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                                            <span 
                                                                className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.2 rounded-md"
                                                                style={{ 
                                                                    backgroundColor: `${color}15`, 
                                                                    color: color 
                                                                }}
                                                            >
                                                                {ev.category}
                                                            </span>
                                                            {ev.target_audience && ev.target_audience !== 'Semua' && (
                                                                <span className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                                                                    {ev.target_audience}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center">
                                        <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                                            <CalendarRange className="h-5 w-5" />
                                        </div>
                                        <p className="text-xs font-medium text-navy-700">Belum ada agenda mendatang</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">Tambahkan agenda baru untuk mengisi kalender sekolah.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card className="border-navy-100/60 bg-gradient-to-br from-navy-50/40 via-white to-gold-50/20 shadow-xs">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2 text-navy-950">
                                    <Info className="h-4 w-4 text-gold-600 shrink-0" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider">Tips Navigasi</h4>
                                </div>
                                <ul className="text-xs text-navy-600 space-y-1.5 pl-5 list-disc leading-relaxed">
                                    <li>Klik & seret pada tanggal untuk membuat agenda multi-hari sekaligus.</li>
                                    <li>Klik kotak agenda untuk melihat rincian, memperbarui, atau menghapus.</li>
                                    <li>Gunakan tab tampilan (Bulan / Minggu / Daftar) di kanan atas kalender.</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: FullCalendar Container */}
                    <div className="lg:col-span-3">
                        <Card className="border-navy-100/80 shadow-sm bg-white overflow-hidden rounded-2xl">
                            {/* Filter Status Notification Banner */}
                            {selectedCategory !== 'all' && (
                                <div className="bg-navy-50/80 border-b border-navy-100 px-4 py-2.5 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="w-2.5 h-2.5 rounded-full" 
                                            style={{ backgroundColor: category_colors[selectedCategory] || '#2563eb' }}
                                        />
                                        <span className="text-navy-700">
                                            Memfilter berdasarkan kategori: <strong className="text-navy-950 font-semibold">{selectedCategory}</strong>
                                        </span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedCategory('all')}
                                        className="font-semibold text-gold-700 hover:text-gold-800 underline underline-offset-2"
                                    >
                                        Tampilkan Semua
                                    </button>
                                </div>
                            )}

                            <CardContent className="p-5">
                                <div className="fc-custom-calendar">
                                    <FullCalendar
                                        ref={calendarRef}
                                        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
                                        initialView="dayGridMonth"
                                        locales={[idLocale]}
                                        locale="id"
                                        headerToolbar={{
                                            left: 'prev,next today',
                                            center: 'title',
                                            right: 'dayGridMonth,timeGridWeek,listMonth'
                                        }}
                                        buttonText={{
                                            today: 'Hari Ini',
                                            month: 'Bulan',
                                            week: 'Minggu',
                                            list: 'Daftar Agenda'
                                        }}
                                        events={fetchEvents}
                                        selectable={true}
                                        select={handleDateSelect}
                                        eventClick={handleEventClick}
                                        height="auto"
                                        aspectRatio={1.6}
                                        dayMaxEvents={3}
                                        moreLinkClick="popover"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Modal Dialog for Add / Edit Agenda */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border-navy-100">
                    <form onSubmit={handleSubmit}>
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white p-6 pb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 border border-white/10">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold text-white tracking-tight">
                                        {modalMode === 'add' ? 'Tambah Agenda Baru' : 'Perbarui Rincian Agenda'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-navy-200 mt-0.5">
                                        {modalMode === 'add' 
                                            ? 'Tambahkan kegiatan baru ke kalender akademik sekolah.' 
                                            : 'Ubah data kegiatan atau hapus dari kalender sekolah.'}
                                    </DialogDescription>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                                    <Tag className="h-3.5 w-3.5 text-navy-500" />
                                    Judul Agenda <span className="text-red-500">*</span>
                                </Label>
                                <Input 
                                    id="title" 
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="Cth: Penilaian Akhir Semester (PAS) Ganjil"
                                    className="border-slate-200 focus-visible:ring-gold-500"
                                />
                                <FieldError message={errors.title} />
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                                    <Bookmark className="h-3.5 w-3.5 text-navy-500" />
                                    Kategori <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.category} onValueChange={val => setData('category', val)}>
                                    <SelectTrigger className="border-slate-200 focus:ring-gold-500">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => {
                                            const color = category_colors[cat] || '#2563eb';
                                            return (
                                                <SelectItem key={cat} value={cat}>
                                                    <div className="flex items-center gap-2.5">
                                                        <span 
                                                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                                                            style={{ backgroundColor: color }}
                                                        />
                                                        <span className="font-medium text-xs">{cat}</span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FieldError message={errors.category} />
                            </div>

                            {/* Dates (Start & End) */}
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="start_date" className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                                        <CalendarIcon className="h-3.5 w-3.5 text-navy-500" />
                                        Tanggal Mulai <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        type="date" 
                                        id="start_date" 
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        className="border-slate-200 focus-visible:ring-gold-500"
                                    />
                                    <FieldError message={errors.start_date} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="end_date" className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                                        <CalendarIcon className="h-3.5 w-3.5 text-navy-500" />
                                        Tanggal Selesai <span className="text-red-500">*</span>
                                    </Label>
                                    <Input 
                                        type="date" 
                                        id="end_date" 
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        className="border-slate-200 focus-visible:ring-gold-500"
                                    />
                                    <FieldError message={errors.end_date} />
                                </div>
                            </div>

                            {/* Academic Year & Semester */}
                            <div className="grid grid-cols-2 gap-3.5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="academic_year" className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                                        <BookOpen className="h-3.5 w-3.5 text-navy-500" />
                                        Tahun Ajaran
                                    </Label>
                                    <Input 
                                        id="academic_year" 
                                        value={data.academic_year}
                                        onChange={e => setData('academic_year', e.target.value)}
                                        placeholder="Cth: 2025/2026"
                                        className="border-slate-200 focus-visible:ring-gold-500"
                                    />
                                    <FieldError message={errors.academic_year} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="semester" className="text-xs font-semibold text-navy-900">
                                        Semester
                                    </Label>
                                    <Select value={data.semester} onValueChange={val => setData('semester', val)}>
                                        <SelectTrigger className="border-slate-200 focus:ring-gold-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Ganjil">Semester Ganjil</SelectItem>
                                            <SelectItem value="Genap">Semester Genap</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FieldError message={errors.semester} />
                                </div>
                            </div>

                            {/* Target Audience */}
                            <div className="space-y-1.5">
                                <Label htmlFor="target_audience" className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                                    <Users className="h-3.5 w-3.5 text-navy-500" />
                                    Target / Audiens
                                </Label>
                                <Select value={data.target_audience} onValueChange={val => setData('target_audience', val)}>
                                    <SelectTrigger className="border-slate-200 focus:ring-gold-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Semua">Semua Pihak (Umum)</SelectItem>
                                        <SelectItem value="Guru">Guru & Staf Saja</SelectItem>
                                        <SelectItem value="Siswa">Siswa & Wali Murid Saja</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError message={errors.target_audience} />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-navy-500" />
                                    Keterangan Tambahan (Opsional)
                                </Label>
                                <Textarea 
                                    id="description" 
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Tuliskan catatan atau instruksi terkait kegiatan ini..."
                                    rows={3}
                                    className="border-slate-200 focus-visible:ring-gold-500 resize-none text-xs"
                                />
                                <FieldError message={errors.description} />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3">
                            {modalMode === 'edit' ? (
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={handleDelete}
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs font-medium"
                                    disabled={processing}
                                >
                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                    Hapus Agenda
                                </Button>
                            ) : (
                                <div />
                            )}
                            
                            <div className="flex items-center gap-2">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                                >
                                    Batal
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-xs"
                                >
                                    {processing && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                                    {modalMode === 'add' ? 'Simpan Agenda' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
