<?php

namespace App\Services;

use App\Models\Faq;

class ChatbotFaqMatcher
{
    private const QUESTION_STOP_WORDS = [
        'apa', 'apakah', 'saja', 'yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk',
        'dengan', 'ini', 'itu', 'saya', 'kami', 'anda', 'anak', 'bisa', 'boleh',
        'bagaimana', 'cara', 'berapa', 'kapan', 'ada', 'jika', 'ya', 'kah',
        'pendaftaran', 'daftar', 'mendaftar', 'murid', 'baru', 'spmb', 'sekolah',
    ];

    public function match(string $message): ?Faq
    {
        $message = $this->normalize($message);
        if ($message === '') {
            return null;
        }

        $messageWords = $this->questionWords($message);
        $bestMatch = null;
        $bestScore = 0;

        foreach (Faq::active()->orderBy('sort_order')->orderBy('id')->get() as $faq) {
            $question = $this->normalize($faq->question);
            if ($message === $question) {
                return $faq;
            }

            $longestKeyword = 0;
            $matchedKeywords = 0;
            foreach (explode(',', $faq->keywords ?? '') as $keyword) {
                $keyword = $this->normalize($keyword);
                // Match whole words/phrases, rather than substrings or SQL wildcards.
                if ($keyword !== '' && str_contains(' '.$message.' ', ' '.$keyword.' ')) {
                    $longestKeyword = max($longestKeyword, count(explode(' ', $keyword)));
                    $matchedKeywords++;
                }
            }

            $questionWords = $this->questionWords($question);
            $overlap = count(array_intersect($messageWords, $questionWords));
            $questionMatches = $overlap >= 2 && $overlap / max(count($questionWords), 1) >= 0.5;
            if ($matchedKeywords === 0 && ! $questionMatches) {
                continue;
            }

            // Specific phrases and question context outrank generic keywords.
            $score = $longestKeyword * 10 + $overlap * 3 + min($matchedKeywords, 3);
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestMatch = $faq;
            }
        }

        return $bestMatch;
    }

    private function normalize(string $text): string
    {
        return trim(preg_replace('/[^\p{L}\p{N}]+/u', ' ', mb_strtolower($text)));
    }

    private function questionWords(string $text): array
    {
        return array_values(array_diff(array_unique(explode(' ', $text)), self::QUESTION_STOP_WORDS));
    }
}
