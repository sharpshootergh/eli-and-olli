import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), '.data', 'uploads');

function ensureUploadsDirExists() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[Upload API] Error creating uploads dir:', err);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    ensureUploadsDirExists();

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `file_${Date.now()}_${sanitizedName}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/api/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl, filename });
  } catch (err) {
    console.error('[Upload API Error]', err);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
