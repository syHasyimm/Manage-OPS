<?php

namespace App\Http\Requests\Registration;

use App\Support\RegistrationOptions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStep3Request extends FormRequest
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
        $parentRules = [
            'name' => ['required', 'string', 'max:255'],
            'nik' => ['nullable', 'digits:16'],
            'occupation' => ['required', Rule::in(array_keys(RegistrationOptions::OCCUPATIONS))],
            'education' => ['required', Rule::in(array_keys(RegistrationOptions::EDUCATIONS))],
            'monthly_income' => ['required', Rule::in(array_keys(RegistrationOptions::INCOMES))],
            'is_alive' => ['required', 'boolean'],
        ];

        $rules = [
            'contact_email' => ['required', 'email', 'max:255'],
            'has_guardian' => ['required', 'boolean'],
        ];

        foreach (['father', 'mother'] as $role) {
            foreach ($parentRules as $field => $rule) {
                $rules["{$role}.{$field}"] = $rule;
            }
        }

        // Wali bersifat opsional, divalidasi via withValidator.
        $rules['guardian.name'] = ['nullable', 'string', 'max:255'];
        $rules['guardian.nik'] = ['nullable', 'digits:16'];
        $rules['guardian.occupation'] = ['nullable', Rule::in(array_keys(RegistrationOptions::OCCUPATIONS))];
        $rules['guardian.education'] = ['nullable', Rule::in(array_keys(RegistrationOptions::EDUCATIONS))];
        $rules['guardian.monthly_income'] = ['nullable', Rule::in(array_keys(RegistrationOptions::INCOMES))];
        $rules['guardian.phone'] = ['nullable', 'regex:/^08[0-9]{8,12}$/'];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'father.nik.digits' => 'NIK Ayah harus 16 digit angka.',
            'mother.nik.digits' => 'NIK Ibu harus 16 digit angka.',
            'guardian.nik.digits' => 'NIK Wali harus 16 digit angka.',
            'guardian.phone.regex' => 'Format nomor HP Wali tidak valid.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->sometimes(['guardian.name', 'guardian.occupation', 'guardian.education', 'guardian.monthly_income'], ['required'], function ($input) {
            return (bool) $input->has_guardian;
        });
    }
}
