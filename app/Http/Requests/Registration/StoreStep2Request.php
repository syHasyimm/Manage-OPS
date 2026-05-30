<?php

namespace App\Http\Requests\Registration;

use App\Support\RegistrationOptions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStep2Request extends FormRequest
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
            'height_cm' => ['required', 'integer', 'min:50', 'max:200'],
            'weight_kg' => ['required', 'integer', 'min:5', 'max:100'],
            'hobby' => ['nullable', 'string', 'max:120'],
            'aspiration' => ['nullable', 'string', 'max:120'],
            'birth_certificate_number' => ['nullable', 'string', 'max:60'],
            'distance_category' => ['required', Rule::in(array_keys(RegistrationOptions::DISTANCE_CATEGORIES))],
            'distance_km' => ['nullable', 'numeric', 'min:0.1', 'max:100'],
            'travel_time_minutes' => ['nullable', 'integer', 'min:1', 'max:300'],
            'siblings_count' => ['required', 'integer', 'min:0', 'max:30'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->sometimes('distance_km', ['required', 'numeric', 'min:1'], function ($input) {
            return $input->distance_category === '>1km';
        });
    }
}
