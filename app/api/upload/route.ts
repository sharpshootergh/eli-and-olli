import { NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/admin';
import { checkIsAdminRequest } from '@/lib/admin-guard';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), '.data', 'uploads');

function saveFileLocally(buffer: Buffer, filename: string): string {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return `/api/uploads/${filename}`;
}

export async function POST(request: Request) {
  const isAdmin = await checkIsAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'story-media';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `file_${Date.now()}_${sanitizedName}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient();

      // 1. Attempt upload to Supabase Storage bucket
      let { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(filename, buffer, {
          contentType: file.type || 'application/octet-stream',
          upsert: true,
        });

      // 2. If bucket does not exist, auto-create public bucket and retry
      if (uploadErr && uploadErr.message?.toLowerCase().includes('bucket not found')) {
        console.warn(`[Upload API] Bucket '${bucket}' not found. Attempting auto-creation...`);
        const { error: createErr } = await supabase.storage.createBucket(bucket, {
          public: true,
        });

        if (!createErr) {
          const retry = await supabase.storage
            .from(bucket)
            .upload(filename, buffer, {
              contentType: file.type || 'application/octet-stream',
              upsert: true,
            });
          uploadErr = retry.error;
        } else {
          console.warn(`[Upload API] Failed to auto-create bucket '${bucket}':`, createErr.message);
        }
      }

      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);
        return NextResponse.json({
          success: true,
          url: urlData.publicUrl,
          filename,
          bucket,
        });
      }

      console.warn('[Upload API] Supabase storage upload failed, using local fallback:', uploadErr.message);
    }

    // 3. Local fallback storage
    const localUrl = saveFileLocally(buffer, filename);
    return NextResponse.json({
      success: true,
      url: localUrl,
      filename,
      bucket: 'local',
    });
  } catch (err) {
    console.error('[Upload API Error]', err);
    return NextResponse.json({ error: 'Failed to upload media file' }, { status: 500 });
  }
}
