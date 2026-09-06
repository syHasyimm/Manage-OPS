import { useForm } from '@inertiajs/react';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Button } from '@/Components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

function FieldError({ message }) {
    if (!message) return null;
    return <p className="text-xs text-red-600 mt-1">{message}</p>;
}

export default function Form({ staff = null }) {
    const isEdit = !!staff;

    const form = useForm({
        name: staff?.name ?? '',
        nip: staff?.nip ?? '',
        nuptk: staff?.nuptk ?? '',
        nik: staff?.nik ?? '',
        birth_place: staff?.birth_place ?? '',
        birth_date: staff?.birth_date ?? '',
        jabatan: staff?.jabatan ?? '',
        pangkat: staff?.pangkat ?? '',
        golongan: staff?.golongan ?? '',
        jenis: staff?.jenis ?? 'guru',
    });

    const submit = (e) => {
        e.preventDefault();
        
        if (isEdit) {
            form.put(route('admin.staff.update', { staff: staff.id }));
        } else {
            form.post(route('admin.staff.store'));
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Name */}
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Cth: Budi Santoso, S.Pd."
                                required
                            />
                            <FieldError message={form.errors.name} />
                        </div>

                        {/* NIK */}
                        <div className="space-y-2">
                            <Label htmlFor="nik">NIK <span className="text-red-500">*</span></Label>
                            <Input
                                id="nik"
                                value={form.data.nik}
                                onChange={(e) => form.setData('nik', e.target.value)}
                                placeholder="16 Digit NIK"
                                required
                            />
                            <FieldError message={form.errors.nik} />
                        </div>

                        {/* Jenis */}
                        <div className="space-y-2">
                            <Label htmlFor="jenis">Jenis Pegawai <span className="text-red-500">*</span></Label>
                            <Select
                                value={form.data.jenis}
                                onValueChange={(val) => form.setData('jenis', val)}
                            >
                                <SelectTrigger id="jenis">
                                    <SelectValue placeholder="Pilih Jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="guru">Guru</SelectItem>
                                    <SelectItem value="tendik">Tenaga Kependidikan</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError message={form.errors.jenis} />
                        </div>

                        {/* NIP */}
                        <div className="space-y-2">
                            <Label htmlFor="nip">NIP</Label>
                            <Input
                                id="nip"
                                value={form.data.nip}
                                onChange={(e) => form.setData('nip', e.target.value)}
                                placeholder="Opsional untuk non-PNS"
                            />
                            <FieldError message={form.errors.nip} />
                        </div>

                        {/* NUPTK */}
                        <div className="space-y-2">
                            <Label htmlFor="nuptk">NUPTK</Label>
                            <Input
                                id="nuptk"
                                value={form.data.nuptk}
                                onChange={(e) => form.setData('nuptk', e.target.value)}
                                placeholder="Opsional"
                            />
                            <FieldError message={form.errors.nuptk} />
                        </div>

                        {/* Tempat Lahir */}
                        <div className="space-y-2">
                            <Label htmlFor="birth_place">Tempat Lahir <span className="text-red-500">*</span></Label>
                            <Input
                                id="birth_place"
                                value={form.data.birth_place}
                                onChange={(e) => form.setData('birth_place', e.target.value)}
                                required
                            />
                            <FieldError message={form.errors.birth_place} />
                        </div>

                        {/* Tanggal Lahir */}
                        <div className="space-y-2">
                            <Label htmlFor="birth_date">Tanggal Lahir <span className="text-red-500">*</span></Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={form.data.birth_date}
                                onChange={(e) => form.setData('birth_date', e.target.value)}
                                required
                            />
                            <FieldError message={form.errors.birth_date} />
                        </div>

                        {/* Jabatan */}
                        <div className="space-y-2">
                            <Label htmlFor="jabatan">Jabatan <span className="text-red-500">*</span></Label>
                            <Input
                                id="jabatan"
                                value={form.data.jabatan}
                                onChange={(e) => form.setData('jabatan', e.target.value)}
                                placeholder="Cth: Guru Kelas, Kepala Sekolah"
                                required
                            />
                            <FieldError message={form.errors.jabatan} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pangkat">Pangkat</Label>
                            <Input
                                id="pangkat"
                                value={form.data.pangkat}
                                onChange={(e) => form.setData('pangkat', e.target.value)}
                                placeholder="Cth: Penata Muda Tk.I (Opsional)"
                            />
                            <FieldError message={form.errors.pangkat} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="golongan">Golongan</Label>
                            <Input
                                id="golongan"
                                value={form.data.golongan}
                                onChange={(e) => form.setData('golongan', e.target.value)}
                                placeholder="Cth: III/b (Opsional)"
                            />
                            <FieldError message={form.errors.golongan} />
                        </div>
                    </div>

                    <div className="flex items-center justify-end border-t border-navy-100 pt-6">
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Simpan Data
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
