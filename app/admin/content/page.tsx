'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { ArrowDown, ArrowUp, ExternalLink, Play, Trash2, Upload, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { MediaType, SiteMedia, SiteMediaSection, VideoProvider } from '@/lib/types';

const sectionLabels: Record<SiteMediaSection, string> = {
  hero: 'Home hero slideshow',
  story: 'Our Story',
};

export default function AdminContentPage() {
  const [items, setItems] = useState<SiteMedia[]>([]);
  const [section, setSection] = useState<SiteMediaSection>('hero');
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [videoProvider, setVideoProvider] = useState<VideoProvider>('file');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [objectPosition, setObjectPosition] = useState('center 25%');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      } else {
        const supabase = createClient();
        const { data: dbData } = await supabase
          .from('site_media')
          .select('*')
          .order('section', { ascending: true })
          .order('sort_order', { ascending: true });
        if (dbData) setItems(dbData as SiteMedia[]);
      }
    } catch {
      // Ignore load error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const chooseSection = (next: SiteMediaSection) => {
    setSection(next);
    if (next === 'hero') {
      setMediaType('image');
      setVideoProvider('file');
    }
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
    setVideoProvider('file');
    setUploading(true);
    try {
      const supabase = createClient();
      const filename = `content-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { error } = await supabase.storage.from('story-media').upload(filename, file);
      if (!error) {
        const { data } = supabase.storage.from('story-media').getPublicUrl(filename);
        setMediaUrl(data.publicUrl);
      } else {
        setMediaUrl(URL.createObjectURL(file));
      }
    } catch {
      setMediaUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  };

  const addMedia = async (event: FormEvent) => {
    event.preventDefault();
    if (!mediaUrl.trim() || (section === 'hero' && mediaType !== 'image')) return;

    const sort_order = items.filter((item) => item.section === section).length + 1;
    const newItem: SiteMedia = {
      id: `media-${Date.now()}`,
      section,
      media_url: mediaUrl.trim(),
      media_type: mediaType,
      video_provider: mediaType === 'video' ? videoProvider : 'file',
      caption: caption.trim() || null,
      object_position: objectPosition.trim() || 'center 25%',
      sort_order,
    };

    setItems((current) => [...current, newItem]);

    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: newItem }),
      });
      setSuccessMsg('Content item saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      // Local state updated
    }

    setMediaUrl('');
    setCaption('');
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this content item?')) return;
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      await fetch(`/api/content?id=${id}`, { method: 'DELETE' });
    } catch {
      // Local state updated
    }
  };

  const move = async (item: SiteMedia, direction: -1 | 1) => {
    const group = items.filter((entry) => entry.section === item.section);
    const index = group.findIndex((entry) => entry.id === item.id);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= group.length) return;
    [group[index], group[nextIndex]] = [group[nextIndex], group[index]];
    const reordered = group.map((entry, idx) => ({ ...entry, sort_order: idx + 1 }));
    setItems((current) => current.map((entry) => reordered.find((next) => next.id === entry.id) ?? entry));

    try {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reordered }),
      });
    } catch {
      // Local state updated
    }
  };

  const visibleItems = items.filter((item) => item.section === section);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="font-serif text-2xl text-wedding-ink">Site content management</h2>
        <p className="text-sm text-wedding-muted">Manage home hero slideshow photos, Story photos, and story video URL.</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(Object.keys(sectionLabels) as SiteMediaSection[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => chooseSection(option)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
              section === option ? 'bg-wedding-blue text-white' : 'bg-wedding-brown/40 text-wedding-muted hover:bg-wedding-brown'
            }`}
          >
            {sectionLabels[option]}
          </button>
        ))}
      </div>

      <form onSubmit={addMedia} className="border border-wedding-brown bg-wedding-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl text-wedding-ink">Add to {sectionLabels[section]}</h3>
            <p className="text-xs text-wedding-muted mt-1">
              {section === 'hero'
                ? 'Add image URLs or upload files. Order determines the slideshow sequence.'
                : 'Add story images, an MP4 video URL, or YouTube embed URL.'}
            </p>
          </div>
          <label className="btn-secondary cursor-pointer inline-flex gap-2 self-start">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload file'}
            <input
              type="file"
              accept={section === 'hero' ? 'image/*' : 'image/*,video/mp4,video/webm,video/quicktime'}
              className="hidden"
              onChange={uploadFile}
            />
          </label>
        </div>

        {section === 'story' && (
          <div className="flex flex-wrap gap-2">
            {(['image', 'video'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMediaType(type)}
                className={`px-3 py-2 text-xs font-semibold ${
                  mediaType === type ? 'bg-wedding-ink text-white' : 'bg-wedding-brown/30 text-wedding-muted'
                }`}
              >
                {type === 'image' ? 'Photo' : 'Video'}
              </button>
            ))}
            {mediaType === 'video' && (
              <select
                value={videoProvider}
                onChange={(event) => setVideoProvider(event.target.value as VideoProvider)}
                className="border border-wedding-brown bg-white px-3 py-2 text-xs"
              >
                <option value="file">Uploaded video / MP4 URL</option>
                <option value="youtube">YouTube embed URL</option>
              </select>
            )}
          </div>
        )}

        <input
          value={mediaUrl}
          onChange={(event) => setMediaUrl(event.target.value)}
          placeholder={
            mediaType === 'video' && videoProvider === 'youtube'
              ? 'Paste YouTube embed URL (e.g. https://www.youtube.com/embed/...)'
              : 'Paste an image or video URL, or upload a file'
          }
          className="w-full border border-wedding-brown px-4 py-3 text-sm"
          required
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Caption (optional)"
            className="border border-wedding-brown px-4 py-3 text-sm"
          />
          <input
            value={objectPosition}
            onChange={(event) => setObjectPosition(event.target.value)}
            placeholder="Image focus position (e.g. center 25%)"
            className="border border-wedding-brown px-4 py-3 text-sm"
          />
        </div>
        <button type="submit" disabled={uploading || !mediaUrl.trim()} className="btn-primary disabled:opacity-50">
          Save content
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="font-serif text-xl text-wedding-ink">Current {sectionLabels[section].toLowerCase()}</h3>
        {loading ? (
          <p className="text-sm text-wedding-muted">Loading content items…</p>
        ) : visibleItems.length === 0 ? (
          <p className="border border-dashed border-wedding-brown p-6 text-sm text-wedding-muted">
            No custom items added yet. The website is currently displaying built-in couple photos until you add custom items here.
          </p>
        ) : (
          <ul className="space-y-3">
            {visibleItems.map((item, index) => (
              <li key={item.id} className="flex items-center gap-4 border border-wedding-brown bg-wedding-white p-3">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden bg-wedding-brown/30">
                  {item.media_type === 'image' ? (
                    <Image src={item.media_url} alt={item.caption || ''} fill className="object-cover" unoptimized />
                  ) : item.video_provider === 'youtube' ? (
                    <div className="flex h-full items-center justify-center">
                      <Play className="w-6 h-6 text-wedding-blue" />
                    </div>
                  ) : (
                    <video src={item.media_url} className="h-full w-full object-cover" muted />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-wedding-ink truncate">
                    {item.caption || (item.media_type === 'video' ? 'Story video' : 'Untitled image')}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-wedding-muted">
                    {item.media_type}
                    {item.media_type === 'video' ? ` · ${item.video_provider}` : ''}
                  </p>
                </div>
                <a
                  href={item.media_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-wedding-muted hover:text-wedding-blue"
                  aria-label="Open media"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(item, -1)}
                  className="p-2 disabled:opacity-30 hover:bg-wedding-brown/40"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === visibleItems.length - 1}
                  onClick={() => move(item, 1)}
                  className="p-2 disabled:opacity-30 hover:bg-wedding-brown/40"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50"
                  aria-label="Remove media"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
