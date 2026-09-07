'use client';

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { MOCK_MOMENTS } from '@/lib/mockData';
import { MomentMedia, MediaType } from '@/lib/types';
import { Upload, Trash2, ArrowUp, ArrowDown, Play } from 'lucide-react';

export default function AdminMomentsPage() {
  const [items, setItems] = useState<MomentMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/moments');
      const data = await res.json();
      if (data.success && Array.isArray(data.moments)) {
        setItems(data.moments);
      } else {
        setItems(MOCK_MOMENTS);
      }
    } catch {
      setItems(MOCK_MOMENTS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setUploading(true);

    const fallbackUpload = async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const upData = await res.json();
        if (upData.success && upData.url) {
          setMediaUrl(upData.url);
        }
      } catch (err) {
        console.error('Moments upload error:', err);
      }
    };

    try {
      const supabase = createClient();
      const filename = `moment-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { error } = await supabase.storage.from('moments').upload(filename, file);

      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('moments').getPublicUrl(filename);
        setMediaUrl(publicUrlData.publicUrl);
      } else {
        await fallbackUpload();
      }
    } catch {
      await fallbackUpload();
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;

    const sort_order = items.length ? Math.max(...items.map((p) => p.sort_order)) + 1 : 1;
    const payload: MomentMedia = {
      id: `moment-${Date.now()}`,
      image_url: mediaUrl.trim(),
      media_type: mediaType,
      thumbnail_url: null,
      caption: caption.trim() || null,
      sort_order,
    };

    setItems([...items, payload]);

    try {
      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moment: payload }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.moments)) {
        setItems(data.moments);
      }
    } catch {
      /* local updated */
    }

    setMediaUrl('');
    setCaption('');
    setMediaType('image');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    setItems(items.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/moments?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && Array.isArray(data.moments)) {
        setItems(data.moments);
      }
    } catch {
      /* local updated */
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    const reordered = copy.map((item, i) => ({ ...item, sort_order: i + 1 }));
    setItems(reordered);

    try {
      await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moments: reordered }),
      });
    } catch {
      /* local updated */
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl text-wedding-ink">Moments</h2>
        <p className="text-sm text-wedding-muted">Upload photos and short videos (admin only)</p>
      </div>

      <form onSubmit={handleAdd} className="border border-wedding-brown p-6 space-y-4 bg-wedding-white">
        <div className="flex flex-wrap gap-4 items-end">
          <label className="btn-secondary cursor-pointer inline-flex gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Choose image or video'}
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
            className="px-3 py-2 border border-wedding-brown text-sm"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>

        {mediaUrl && (
          <div className="relative w-40 h-28 border border-wedding-brown overflow-hidden">
            {mediaType === 'video' ? (
              <video src={mediaUrl} className="w-full h-full object-cover" muted />
            ) : (
              <Image src={mediaUrl} alt="Preview" fill className="object-cover" unoptimized />
            )}
          </div>
        )}

        <input
          type="text"
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full px-4 py-3 border border-wedding-brown text-sm focus:outline-none focus:ring-2 focus:ring-wedding-blue"
        />

        <button type="submit" disabled={!mediaUrl || uploading} className="btn-primary disabled:opacity-50">
          Add to gallery
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-wedding-muted">Loading…</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-4 border border-wedding-brown p-3 bg-wedding-white"
            >
              <div className="relative w-20 h-16 shrink-0 overflow-hidden bg-wedding-brown/40">
                {item.media_type === 'video' ? (
                  <>
                    <video src={item.image_url} className="w-full h-full object-cover" muted />
                    <Play className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow" />
                  </>
                ) : (
                  <Image
                    src={item.image_url}
                    alt={item.caption || ''}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.caption || 'Untitled'}</p>
                <p className="text-xs text-wedding-muted uppercase tracking-wider">{item.media_type}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(index, -1)} className="p-2 hover:bg-wedding-brown/40">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => move(index, 1)} className="p-2 hover:bg-wedding-brown/40">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
