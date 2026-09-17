import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Calendar as CalendarIcon, Tag, Bookmark, BookOpen, Users, FileText, Trash2, Loader2 } from 'lucide-react';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-[11px] font-medium text-red-500 mt-1">{message}</p>;
}

export default function CalendarEventModal({
    isOpen,
    setIsOpen,
    mode,
    onSubmit,
    onDelete,
    data,
    setData,
    errors,
    processing,
    categories,
    categoryColors
}) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border-navy-100">
                <form onSubmit={onSubmit}>
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white p-6 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-400 border border-white/10">
                                <CalendarIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold text-white tracking-tight">
                                    {mode === 'add' ? 'Tambah Agenda Baru' : 'Perbarui Rincian Agenda'}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-navy-200 mt-0.5">
                                    {mode === 'add' 
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
                                        const color = categoryColors[cat] || '#2563eb';
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
                        {mode === 'edit' ? (
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onDelete}
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
                                onClick={() => setIsOpen(false)}
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
                                {mode === 'add' ? 'Simpan Agenda' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
