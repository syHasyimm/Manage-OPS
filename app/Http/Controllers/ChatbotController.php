<?php

namespace App\Http\Controllers;

use App\Services\ChatbotAiService;
use App\Services\ChatbotFaqMatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $request->validate(['message' => ['nullable', 'string', 'max:2000']]);
        $message = trim($request->input('message') ?? '');

        if (empty($message)) {
            return response()->json(['message' => 'Pesan tidak boleh kosong.', 'source' => 'error'], 422);
        }

        $faq = app(ChatbotFaqMatcher::class)->match($message);

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
