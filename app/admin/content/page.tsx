'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Play,
  Trash2,
  Upload,
  CheckCircle2,
  Edit3,
  Smartphone,
  Monitor,
  X,
} from 'lucide-react';
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
  const [mobileMediaUrl, setMobileMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [objectPosition, setObjectPosition] = useState('center 25%');
  const [mobileObjectPosition, setMobileObjectPosition] = useState('center 25%');

  const [editingItem, setEditingItem] = useState<SiteMedia | null>(null);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
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
    resetForm();
    if (next === 'hero') {
      setMediaType('image');
      setVideoProvider('file');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setMediaUrl('');
    setMobileMediaUrl('');
    setCaption('');
    setObjectPosition('center 25%');
    setMobileObjectPosition('center 25%');
  };

  const startEdit = (item: SiteMedia) => {
    setEditingItem(item);
    setSection(item.section);
    setMediaType(item.media_type);
    setVideoProvider(item.video_provider || 'file');
    setMediaUrl(item.media_url || '');
    setMobileMediaUrl(item.mobile_media_url || '');
    setCaption(item.caption || '');
    setObjectPosition(item.object_position || 'center 25%');
    setMobileObjectPosition(item.mobile_object_position || item.object_position || 'center 25%');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>, target: 'desktop' | 'mobile') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (target === 'desktop') {
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image');
      setVideoProvider('file');
      setUploadingDesktop(true);
    } else {
      setUploadingMobile(true);
    }

    try {
      const supabase = createClient();
      const filename = `content-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const { error } = await supabase.storage.from('story-media').upload(filename, file);
      if (!error) {
        const { data } = supabase.storage.from('story-media').getPublicUrl(filename);
        if (target === 'desktop') setMediaUrl(data.publicUrl);
        else setMobileMediaUrl(data.publicUrl);
      } else {
        const blobUrl = URL.createObjectURL(file);
        if (target === 'desktop') setMediaUrl(blobUrl);
        else setMobileMediaUrl(blobUrl);
      }
    } catch {
      const blobUrl = URL.createObjectURL(file);
      if (target === 'desktop') setMediaUrl(blobUrl);
      else setMobileMediaUrl(blobUrl);
    } finally {
      if (target === 'desktop') setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  const saveMedia = async (event: FormEvent) => {
    event.preventDefault();
    if (!mediaUrl.trim() || (section === 'hero' && mediaType !== 'image')) return;

    const sort_order = editingItem ? editingItem.sort_order : items.filter((item) => item.section === section).length + 1;
    const generatedId = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `10000000-0000-4000-a000-${Date.now().toString().slice(-12).padStart(12, '0')}`;

    const targetItem: SiteMedia = {
      id: editingItem ? editingItem.id : generatedId,
      section,
      media_url: mediaUrl.trim(),
      mobile_media_url: mobileMediaUrl.trim() || null,
      media_type: mediaType,
      video_provider: mediaType === 'video' ? videoProvider : 'file',
      caption: caption.trim() || null,
      object_position: objectPosition.trim() || 'center 25%',
      mobile_object_position: mobileObjectPosition.trim() || objectPosition.trim() || 'center 25%',
      sort_order,
    };

    if (editingItem) {
      setItems((current) => current.map((i) => (i.id === targetItem.id ? targetItem : i)));
    } else {
      setItems((current) => [...current, targetItem]);
    }

    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: targetItem }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
      setSuccessMsg(editingItem ? 'Content updated successfully!' : 'Content item saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      // Local state updated
    }

    resetForm();
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this content item?')) return;
    if (editingItem?.id === id) resetForm();
    setItems((current) => current.filter((item) => item.id !== id));
    try {
      const res = await fetch(`/api/content?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
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
        <p className="text-sm text-wedding-muted">
          Manage home hero slideshow photos, Story photos, and story video URL for Desktop & Mobile screen sizes.
        </p>
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

      <form onSubmit={saveMedia} className="border border-wedding-brown bg-wedding-white p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-wedding-brown/30 pb-4">
          <div>
            <h3 className="font-serif text-xl text-wedding-ink">
              {editingItem ? `Edit item in ${sectionLabels[section]}` : `Add to ${sectionLabels[section]}`}
            </h3>
            <p className="text-xs text-wedding-muted mt-1">
              {section === 'hero'
                ? 'Configure Desktop and Mobile images for hero slideshow.'
                : 'Add or edit story images, MP4 video URL, or YouTube embed URL.'}
            </p>
          </div>
          {editingItem && (
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary inline-flex items-center gap-1.5 text-xs text-wedding-muted self-start"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Editing
            </button>
          )}
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

        {/* Desktop Image Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-wedding-ink uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-wedding-blue" />
              Desktop Image / Video URL <span className="text-red-500">*</span>
            </label>
            <label className="btn-secondary cursor-pointer inline-flex gap-1.5 text-xs">
              <Upload className="w-3.5 h-3.5" />
              {uploadingDesktop ? 'Uploading…' : 'Upload Desktop File'}
              <input
                type="file"
                accept={section === 'hero' ? 'image/*' : 'image/*,video/mp4,video/webm,video/quicktime'}
                className="hidden"
                onChange={(e) => uploadFile(e, 'desktop')}
              />
            </label>
          </div>
          <input
            value={mediaUrl}
            onChange={(event) => setMediaUrl(event.target.value)}
            placeholder={
              mediaType === 'video' && videoProvider === 'youtube'
                ? 'Paste YouTube embed URL (e.g. https://www.youtube.com/embed/...)'
                : 'Paste Desktop image URL or upload file above'
            }
            className="w-full border border-wedding-brown px-4 py-3 text-sm"
            required
          />
        </div>

        {/* Mobile Image Section (only for images) */}
        {mediaType === 'image' && (
          <div className="space-y-2 pt-2 border-t border-wedding-brown/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-wedding-ink uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-wedding-gold" />
                Mobile Image URL <span className="text-wedding-muted font-normal text-[11px]">(Optional — for mobile screen sizes)</span>
              </label>
              <label className="btn-secondary cursor-pointer inline-flex gap-1.5 text-xs">
                <Upload className="w-3.5 h-3.5" />
                {uploadingMobile ? 'Uploading…' : 'Upload Mobile File'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadFile(e, 'mobile')}
                />
              </label>
            </div>
            <input
              value={mobileMediaUrl}
              onChange={(event) => setMobileMediaUrl(event.target.value)}
              placeholder="Paste separate Mobile image URL (leave empty to use Desktop image on mobile)"
              className="w-full border border-wedding-brown px-4 py-3 text-sm bg-stone-50/50"
            />
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3 pt-2">
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Caption (optional)"
            className="border border-wedding-brown px-4 py-3 text-sm"
          />
          <input
            value={objectPosition}
            onChange={(event) => setObjectPosition(event.target.value)}
            placeholder="Desktop focal point (e.g. center 25%)"
            className="border border-wedding-brown px-4 py-3 text-sm"
          />
          <input
            value={mobileObjectPosition}
            onChange={(event) => setMobileObjectPosition(event.target.value)}
            placeholder="Mobile focal point (e.g. center top)"
            className="border border-wedding-brown px-4 py-3 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={uploadingDesktop || uploadingMobile || !mediaUrl.trim()} className="btn-primary disabled:opacity-50">
            {editingItem ? 'Update content item' : 'Save content item'}
          </button>
          {editingItem && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        <h3 className="font-serif text-xl text-wedding-ink">Current {sectionLabels[section].toLowerCase()} items ({visibleItems.length})</h3>
        {loading ? (
          <p className="text-sm text-wedding-muted">Loading content items…</p>
        ) : visibleItems.length === 0 ? (
          <p className="border border-dashed border-wedding-brown p-6 text-sm text-wedding-muted">
            No items in this section. Add items using the form above.
          </p>
        ) : (
          <ul className="space-y-3">
            {visibleItems.map((item, index) => (
              <li key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 border border-wedding-brown bg-wedding-white p-4">
                <div className="flex items-center gap-3 shrink-0">
                  {/* Desktop Thumbnail */}
                  <div className="relative h-16 w-20 overflow-hidden bg-wedding-brown/30 border border-wedding-brown/40">
                    {item.media_type === 'image' ? (
                      <Image src={item.media_url} alt={item.caption || ''} fill className="object-cover" unoptimized />
                    ) : item.video_provider === 'youtube' ? (
                      <div className="flex h-full items-center justify-center">
                        <Play className="w-6 h-6 text-wedding-blue" />
                      </div>
                    ) : (
                      <video src={item.media_url} className="h-full w-full object-cover" muted />
                    )}
                    <span className="absolute bottom-0 left-0 bg-wedding-ink/80 text-white text-[9px] px-1 py-0.5 uppercase tracking-tighter">
                      Desktop
                    </span>
                  </div>

                  {/* Mobile Thumbnail if configured */}
                  {item.mobile_media_url && (
                    <div className="relative h-16 w-14 overflow-hidden bg-wedding-brown/30 border border-wedding-brown/40">
                      <Image src={item.mobile_media_url} alt="Mobile version" fill className="object-cover" unoptimized />
                      <span className="absolute bottom-0 left-0 bg-wedding-gold/90 text-white text-[9px] px-1 py-0.5 uppercase tracking-tighter">
                        Mobile
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-medium text-wedding-ink truncate">
                    {item.caption || (item.media_type === 'video' ? 'Story video' : 'Untitled image')}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-wedding-muted">
                    <span className="uppercase tracking-wider font-semibold text-wedding-blue">
                      {item.media_type}
                      {item.media_type === 'video' ? ` · ${item.video_provider}` : ''}
                    </span>
                    <span>Desktop pos: <code className="bg-stone-100 px-1">{item.object_position || 'center 25%'}</code></span>
                    {item.mobile_media_url ? (
                      <span className="text-wedding-gold font-medium">Mobile: Custom image configured</span>
                    ) : (
                      <span>Mobile pos: <code className="bg-stone-100 px-1">{item.mobile_object_position || item.object_position || 'center 25%'}</code></span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="p-2 text-wedding-blue hover:bg-wedding-blue/10 flex items-center gap-1 text-xs font-semibold"
                    title="Edit content item"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
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
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

