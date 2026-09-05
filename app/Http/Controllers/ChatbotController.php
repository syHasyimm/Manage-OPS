<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use App\Services\ChatbotAiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $message = strtolower(trim($request->input('message', '')));

        if (empty($message)) {
            return response()->json(['message' => 'Pesan tidak boleh kosong.', 'source' => 'error'], 422);
        }

        $faq = Faq::where('is_active', true)
            ->where(function ($q) use ($message) {
                $q->whereRaw('LOWER(question) LIKE ?', ["%{$message}%"])
                    ->orWhereRaw('LOWER(keywords) LIKE ?', ["%{$message}%"]);
            })
            ->orderBy('sort_order')
            ->first();

        if ($faq) {
            return response()->json([
                'sender' => 'bot',
                'message' => $faq->answer,
                'source' => 'local_db',
            ]);
        }

        $aiResponse = app(ChatbotAiService::class)->generate($message);

        return response()->json([
            'sender' => 'bot',
            'message' => $aiResponse,
            'source' => 'ai_api',
        ]);
    }
}
