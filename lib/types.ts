export type GoalType = 'capped' | 'open';
export type MediaType = 'image' | 'video';
export type SiteMediaSection = 'hero' | 'story';
export type VideoProvider = 'file' | 'youtube';
export type Attendance = 'traditional' | 'white' | 'both' | 'none';

export interface WeddingEventRow {
  id: string;
  name: string;
  event_date: string;
  event_time: string | null;
  location: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_at?: string;
}

export interface Goal {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: GoalType;
  target_amount: number | null;
  amount_raised: number;
  contributor_count: number;
  sort_order: number;
  created_at?: string;
}

export interface Contribution {
  id: string;
  goal_id: string;
  contributor_name: string;
  contributor_email: string;
  contributor_phone: string | null;
  amount: number;
  message: string | null;
  paystack_reference: string;
  created_at: string;
  goal?: Goal;
}

export interface MomentMedia {
  id: string;
  image_url: string;
  media_type: MediaType;
  thumbnail_url: string | null;
  caption: string | null;
  sort_order: number;
  created_at?: string;
}

export interface SiteMedia {
  id: string;
  section: SiteMediaSection;
  media_url: string;
  mobile_media_url?: string | null;
  media_type: MediaType;
  video_provider: VideoProvider;
  caption: string | null;
  object_position: string;
  mobile_object_position?: string | null;
  sort_order: number;
  created_at?: string;
}

/** @deprecated use MomentMedia */
export type MomentPhoto = MomentMedia;

export interface Rsvp {
  id: string;
  guest_name: string;
  guest_email: string;
  attendance: Attendance;
  guest_count: number;
  notes: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  added_by: string | null;
  created_at: string;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}
