<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Registration;
use App\Models\RegistrationPeriod;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $period = RegistrationPeriod::active();

        $base = Registration::query()->when($period, fn ($q) => $q->where('period_id', $period->id));

        $statusCounts = (clone $base)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $genderCounts = (clone $base)
            ->join('student_identities', 'student_identities.registration_id', '=', 'registrations.id')
            ->selectRaw('student_identities.gender as label, count(*) as total')
            ->groupBy('student_identities.gender')
            ->get()
            ->map(fn ($row) => [
                'label' => $row->label === 'L' ? 'Laki-Laki' : 'Perempuan',
                'total' => (int) $row->total,
            ]);

        $religionCounts = (clone $base)
            ->join('student_identities', 'student_identities.registration_id', '=', 'registrations.id')
            ->selectRaw('student_identities.religion as label, count(*) as total')
            ->groupBy('student_identities.religion')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'label' => ucfirst($row->label),
                'total' => (int) $row->total,
            ]);

        $dusunTop = (clone $base)
            ->join('student_identities', 'student_identities.registration_id', '=', 'registrations.id')
            ->selectRaw('student_identities.dusun_name as label, count(*) as total')
            ->groupBy('student_identities.dusun_name')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'label' => $row->label,
                'total' => (int) $row->total,
            ]);

        $totalUsers = User::where('role', User::ROLE_USER)->count();
        $totalSubmitted = (clone $base)->whereNotNull('submitted_at')->count();
        $totalAccepted = (clone $base)->where('status', Registration::STATUS_ACCEPTED)->count();
        $totalAll = (clone $base)->count();

        return Inertia::render('Admin/Dashboard', [
            'period' => $period,
            'stats' => [
                'total_users' => $totalUsers,
                'total_registrations' => $totalAll,
                'total_submitted' => $totalSubmitted,
                'total_accepted' => $totalAccepted,
            ],
            'status_counts' => $statusCounts,
            'gender_counts' => $genderCounts,
            'religion_counts' => $religionCounts,
            'dusun_top' => $dusunTop,
        ]);
    }
}
