<?php

namespace App\Http\Requests\Registration;

use App\Support\RegistrationOptions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStep1Request extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::in(array_keys(RegistrationOptions::GENDERS))],
            'nik' => ['required', 'digits:16'],
            'kk_number' => ['required', 'digits:16'],
            'previous_kindergarten' => ['nullable', 'string', 'max:255'],
            'birth_place' => ['required', 'string', 'max:120'],
            'birth_date' => ['required', 'date', 'before:today'],
            'has_special_needs' => ['required', 'boolean'],
            'special_needs_types' => ['array'],
            'special_needs_types.*' => [Rule::in(array_keys(RegistrationOptions::SPECIAL_NEEDS))],
            'religion' => ['required', Rule::in(array_keys(RegistrationOptions::RELIGIONS))],
            'dusun_name' => ['required', 'string', 'max:120'],
            'kelurahan_name' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:500'],
            'rt' => ['required', 'string', 'max:4'],
            'rw' => ['required', 'string', 'max:4'],
            'postal_code' => ['required', 'digits:5'],
            'residence_type' => ['required', Rule::in(array_keys(RegistrationOptions::RESIDENCE_TYPES))],
            'transportation' => ['required', Rule::in(array_keys(RegistrationOptions::TRANSPORTATIONS))],
            'child_order' => ['required', 'integer', 'min:1', 'max:20'],
            'phone_wa' => ['required', 'regex:/^08[0-9]{8,12}$/'],
            'is_kps_kph_recipient' => ['required', 'boolean'],
            'has_kip' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nik.digits' => 'NIK harus 16 digit angka.',
            'kk_number.digits' => 'No KK harus 16 digit angka.',
            'postal_code.digits' => 'Kode pos harus 5 digit angka.',
            'phone_wa.regex' => 'Format nomor HP/WA tidak valid (contoh: 081234567890).',
            'birth_date.before' => 'Tanggal lahir harus sebelum hari ini.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->sometimes('special_needs_types', ['required', 'array', 'min:1'], function ($input) {
            return (bool) $input->has_special_needs;
        });
    }
}
