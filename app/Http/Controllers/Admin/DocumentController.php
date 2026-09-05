<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public const CATEGORIES = ['Surat', 'SK', 'Rapor', 'Ijazah', 'Sertifikat', 'Administrasi', 'Lainnya'];

    public const STATUSES = ['Aktif', 'Arsip'];

    public function index(Request $request)
    {
        $query = Document::query()->with('uploader')->latest();

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%")
                    ->orWhere('tags', 'like', "%{$search}%");
            });
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        if ($year = $request->query('academic_year')) {
            $query->where('academic_year', $year);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $documents = $query->paginate(20)->withQueryString();

        $documents->getCollection()->transform(function ($doc) {
            $data = $doc->toArray();
            $data['file_size_mb'] = $doc->file_size_mb;
            $data['uploader_name'] = $doc->uploader ? $doc->uploader->name : 'Sistem';

            return $data;
        });

        // Optional: Get unique academic years for the filter dropdown
        $years = Document::select('academic_year')
            ->whereNotNull('academic_year')
            ->distinct()
            ->orderBy('academic_year', 'desc')
            ->pluck('academic_year');

        return Inertia::render('Admin/Documents/Index', [
            'documents' => $documents,
            'filters' => $request->only(['q', 'category', 'academic_year', 'status']),
            'categories' => self::CATEGORIES,
            'statuses' => self::STATUSES,
            'years' => $years,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Documents/Create', [
            'categories' => self::CATEGORIES,
            'statuses' => self::STATUSES,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', Rule::in(self::CATEGORIES)],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'string', Rule::in(self::STATUSES)],
            'tags' => ['nullable', 'string'], // Will be received as comma-separated or json from frontend
            'file' => [
                'required',
                'file',
                'max:10240', // 10MB
                'mimes:pdf,doc,docx,xls,xlsx,csv,ppt,pptx,jpg,jpeg,png',
            ],
        ]);

        $file = $request->file('file');
        $filePath = $file->store('documents', 'public');

        $tagsArray = [];
        if ($request->tags) {
            // Frontend might send JSON string or comma separated string
            $decoded = json_decode($request->tags, true);
            if (is_array($decoded)) {
                $tagsArray = $decoded;
            } else {
                $tagsArray = array_map('trim', explode(',', $request->tags));
            }
        }

        Document::create([
            'title' => $request->title,
            'file_path' => $filePath,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'category' => $request->category,
            'academic_year' => $request->academic_year,
            'tags' => array_values(array_filter($tagsArray)),
            'status' => $request->status,
            'uploaded_by' => $request->user()->id,
        ]);

        return redirect()->route('admin.documents.index')->with('status', 'Dokumen berhasil diunggah.');
    }

    public function edit(Document $document)
    {
        $tags = $document->tags ? implode(', ', $document->tags) : '';
        $docArray = $document->toArray();
        $docArray['tags'] = $tags;

        return Inertia::render('Admin/Documents/Edit', [
            'document' => $docArray,
            'categories' => self::CATEGORIES,
            'statuses' => self::STATUSES,
        ]);
    }

    public function update(Request $request, Document $document)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', Rule::in(self::CATEGORIES)],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'string', Rule::in(self::STATUSES)],
            'tags' => ['nullable', 'string'],
            'file' => [
                'nullable',
                'file',
                'max:10240', // 10MB
                'mimes:pdf,doc,docx,xls,xlsx,csv,ppt,pptx,jpg,jpeg,png',
            ],
        ]);

        $tagsArray = [];
        if ($request->tags) {
            $decoded = json_decode($request->tags, true);
            if (is_array($decoded)) {
                $tagsArray = $decoded;
            } else {
                $tagsArray = array_map('trim', explode(',', $request->tags));
            }
        }

        $data = [
            'title' => $request->title,
            'category' => $request->category,
            'academic_year' => $request->academic_year,
            'tags' => array_values(array_filter($tagsArray)),
            'status' => $request->status,
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $data['file_path'] = $file->store('documents', 'public');
            $data['file_name'] = $file->getClientOriginalName();
            $data['mime_type'] = $file->getMimeType();
            $data['file_size'] = $file->getSize();

            // Optionally, delete the old file if you don't want to keep it
            if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }
        }

        $document->update($data);

        return redirect()->route('admin.documents.index')->with('status', 'Data dokumen berhasil diperbarui.');
    }

    public function destroy(Document $document)
    {
        $document->delete(); // Soft delete

        return redirect()->route('admin.documents.index')->with('status', 'Dokumen berhasil dipindahkan ke tempat sampah.');
    }

    public function download(Document $document)
    {
        if (! Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    public function preview(Document $document)
    {
        if (! Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'File not found');
        }

        $path = Storage::disk('public')->path($document->file_path);

        return response()->file($path, [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'inline; filename="'.$document->file_name.'"',
        ]);
    }
}
