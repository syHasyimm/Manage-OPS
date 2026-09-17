import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Clock, CalendarRange } from 'lucide-react';
import { formatDateRange } from '@/lib/date';

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

export default function UpcomingEventsWidget({ upcoming_events = [], category_colors = {}, onEventClick }) {
    return (
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
                                    onClick={() => onEventClick(ev)}
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
    );
}
