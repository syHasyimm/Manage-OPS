<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationTemplate;
use App\Support\NotificationTemplates;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class NotificationTemplateController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/NotificationTemplates/Index', [
            'templates' => NotificationTemplate::query()
                ->orderBy('category')
                ->orderBy('name')
                ->get(),
            'categories' => NotificationTemplates::categories(),
            'variables' => NotificationTemplates::variableDefinitions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $this->validateBody($data['category'], $data['body']);

        NotificationTemplate::create($data);

        return back()->with('status', 'Template notifikasi berhasil ditambahkan.');
    }

    public function update(Request $request, NotificationTemplate $notificationTemplate): RedirectResponse
    {
        $data = $this->validatedData($request, $notificationTemplate);
        $this->validateBody($data['category'], $data['body']);

        $notificationTemplate->update($data);

        return back()->with('status', 'Template notifikasi berhasil diperbarui.');
    }

    public function destroy(NotificationTemplate $notificationTemplate): RedirectResponse
    {
        $notificationTemplate->delete();

        return back()->with('status', 'Template notifikasi berhasil dihapus.');
    }

    protected function validatedData(Request $request, ?NotificationTemplate $template = null): array
    {
        $nameRule = Rule::unique('notification_templates', 'name')
            ->where(fn ($query) => $query->where('category', $request->input('category')));

        if ($template) {
            $nameRule->ignore($template->id);
        }

        $data = $request->validate([
            'category' => ['required', Rule::in(array_keys(NotificationTemplates::categories()))],
            'name' => ['required', 'string', 'max:100', $nameRule],
            'body' => ['required', 'string', 'max:10000'],
        ]);

        $data['name'] = trim($data['name']);

        return $data;
    }

    protected function validateBody(string $category, string $body): void
    {
        try {
            NotificationTemplates::assertValidBody($category, $body);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages([
                'body' => $exception->getMessage(),
            ]);
        }
    }
}
