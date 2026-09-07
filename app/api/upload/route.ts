import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = (formData.get('bucket') as string) || 'story-media';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `file_${Date.now()}_${sanitizedName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Ensure bucket exists or set default options
    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });

    if (uploadErr) {
      console.error('[Upload API] Supabase storage upload error:', uploadErr);
      return NextResponse.json(
        { error: `Supabase Storage upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // 2. Get public URL from Supabase Storage
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filename,
      bucket,
    });
  } catch (err) {
    console.error('[Upload API Error]', err);
    return NextResponse.json({ error: 'Failed to upload media to Supabase Storage' }, { status: 500 });
  }
}
