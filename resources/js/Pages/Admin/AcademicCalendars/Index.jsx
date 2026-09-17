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
import { Button } from '@/Components/ui/button';
import { toast } from 'sonner';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import idLocale from '@fullcalendar/core/locales/id';

import UpcomingEventsWidget from './Components/UpcomingEventsWidget';
import CalendarEventModal from './Components/CalendarEventModal';
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
                        <UpcomingEventsWidget 
                            upcoming_events={upcoming_events} 
                            category_colors={category_colors} 
                            onEventClick={openEditFromUpcoming} 
                        />

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
            <CalendarEventModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                mode={modalMode}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                categories={categories}
                categoryColors={category_colors}
            />
        </AdminLayout>
    );
}
