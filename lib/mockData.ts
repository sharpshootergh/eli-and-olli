import { Category, Goal, MomentMedia, Contribution } from './types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Home', sort_order: 1 },
  { id: 'cat-2', name: 'Honeymoon', sort_order: 2 },
  { id: 'cat-3', name: 'Just because', sort_order: 3 },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: 'goal-1',
    category_id: 'cat-1',
    title: 'Custom Wooden Dining Table',
    description:
      'A handcrafted dining table made from Ghanaian teak where we can host family for Sunday dinners.',
    image_url:
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=1200&auto=format&fit=crop',
    type: 'capped',
    target_amount: 5000,
    amount_raised: 2750,
    contributor_count: 8,
    sort_order: 1,
  },
  {
    id: 'goal-2',
    category_id: 'cat-1',
    title: 'Kitchen Essentials',
    description: 'Espresso and modern kitchen appliances for our new home.',
    image_url:
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=1200&auto=format&fit=crop',
    type: 'capped',
    target_amount: 3500,
    amount_raised: 1200,
    contributor_count: 5,
    sort_order: 2,
  },
  {
    id: 'goal-3',
    category_id: 'cat-2',
    title: 'Safari stay in Mole',
    description: 'Three nights overlooking the watering hole at Mole National Park.',
    image_url:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop',
    type: 'capped',
    target_amount: 8000,
    amount_raised: 4800,
    contributor_count: 12,
    sort_order: 1,
  },
  {
    id: 'goal-4',
    category_id: 'cat-2',
    title: 'Beach dinners in Busua',
    description: 'Candlelight dinners on the beach with grilled lobster.',
    image_url:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    type: 'open',
    target_amount: null,
    amount_raised: 1450,
    contributor_count: 18,
    sort_order: 2,
  },
  {
    id: 'goal-5',
    category_id: 'cat-3',
    title: 'Date night fund',
    description: 'Jazz nights and weekend ice cream throughout our first year.',
    image_url:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    type: 'open',
    target_amount: null,
    amount_raised: 920,
    contributor_count: 14,
    sort_order: 1,
  },
];

export const MOCK_MOMENTS: MomentMedia[] = [
  {
    id: 'moment-1',
    image_url:
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'A quiet afternoon together.',
    sort_order: 1,
  },
  {
    id: 'moment-2',
    image_url:
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Celebrating with family.',
    sort_order: 2,
  },
  {
    id: 'moment-3',
    image_url:
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1200&auto=format&fit=crop',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Sunset stroll.',
    sort_order: 3,
  },
  {
    id: 'moment-4',
    image_url:
      'https://images.unsplash.com/photo-1529636798458-92182e662485?q=80&w=1200&auto=format&fit=crop',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Weekend away.',
    sort_order: 4,
  },
  {
    id: 'moment-5',
    image_url:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'With close friends.',
    sort_order: 5,
  },
  {
    id: 'moment-6',
    image_url:
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'The proposal.',
    sort_order: 6,
  },
];

export const MOCK_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'contrib-1',
    goal_id: 'goal-1',
    contributor_name: 'Auntie Mercy',
    contributor_email: 'mercy@example.com',
    contributor_phone: '+233 24 000 0000',
    amount: 1000,
    message: 'Blessings!',
    paystack_reference: 'REF_1',
    created_at: '2026-07-20T14:32:00Z',
  },
];
