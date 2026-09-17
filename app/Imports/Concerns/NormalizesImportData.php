<?php

namespace App\Imports\Concerns;

use Illuminate\Support\Carbon;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

trait NormalizesImportData
{
    /**
     * Normalize a row to an array.
     */
    protected function normalizeRow(array $row): array
    {
        if (method_exists($row, 'toArray')) {
            return $row->toArray();
        }

        return is_array($row) ? $row : [];
    }

    /**
     * Check if a row is completely blank.
     */
    protected function isBlank(array $row): bool
    {
        foreach ($row as $value) {
            if ($value instanceof \DateTimeInterface || ($value !== null && trim((string) $value) !== '')) {
                return false;
            }
        }

        return true;
    }

    /**
     * Normalize a value to a string.
     */
    protected function stringValue(mixed $value): ?string
    {
        if ($value === null || is_array($value) || is_object($value)) {
            return null;
        }

        if (is_float($value) && floor($value) === $value) {
            return (string) (int) $value;
        }

        return trim((string) $value);
    }

    /**
     * Normalize a date value to Y-m-d format.
     */
    protected function normalizeDate(mixed $value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        $value = $this->stringValue($value);

        if ($value === null || $value === '') {
            return null;
        }

        if (preg_match('/^\d{8}$/', $value)) {
            try {
                return Carbon::createFromFormat('Ymd', $value)->format('Y-m-d');
            } catch (\Throwable) {
                return $value;
            }
        }

        if (is_numeric($value) && (float) $value >= 20000) {
            try {
                return ExcelDate::excelToDateTimeObject((float) $value)->format('Y-m-d');
            } catch (\Throwable) {
                return $value;
            }
        }

        foreach (['Y-m-d', 'd/m/Y', 'd-m-Y', 'd.m.Y', 'Y/m/d'] as $format) {
            try {
                $date = Carbon::createFromFormat($format, $value);

                if ($date !== false) {
                    return $date->format('Y-m-d');
                }
            } catch (\Throwable) {
                // Try the next supported format.
            }
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable) {
            return $value;
        }
    }
}
