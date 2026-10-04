import { Category, Goal, MomentMedia, Contribution } from './types';

export const MOCK_CATEGORIES: Category[] = [
  { id: '11111111-1111-4111-a111-111111111101', name: 'Our Home', sort_order: 1 },
  { id: '11111111-1111-4111-a111-111111111102', name: 'Honeymoon & Experiences', sort_order: 2 },
  { id: '11111111-1111-4111-a111-111111111103', name: 'Future & Togetherness', sort_order: 3 },
];

export const MOCK_GOALS: Goal[] = [
  {
    id: '22222222-2222-4222-a222-222222222201',
    category_id: '11111111-1111-4111-a111-111111111101',
    title: 'Custom Handcrafted Dining Table',
    description:
      'A handcrafted dining table made from solid Ghanaian teak where we will host family and friends for Sunday dinners.',
    image_url:
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?q=80&w=1200&auto=format&fit=crop',
    type: 'capped',
    target_amount: 5000,
    amount_raised: 0,
    contributor_count: 0,
    sort_order: 1,
  },
  {
    id: '22222222-2222-4222-a222-222222222202',
    category_id: '11111111-1111-4111-a111-111111111101',
    title: 'Kitchen & Home Essentials',
    description: 'Espresso machine and modern kitchen appliances to build our new home together.',
    image_url:
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=1200&auto=format&fit=crop',
    type: 'capped',
    target_amount: 3500,
    amount_raised: 0,
    contributor_count: 0,
    sort_order: 2,
  },
  {
    id: '22222222-2222-4222-a222-222222222203',
    category_id: '11111111-1111-4111-a111-111111111102',
    title: 'Honeymoon Safari Excursion',
    description: 'A magical stay and game drive experience during our honeymoon getaway.',
    image_url:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop',
    type: 'capped',
    target_amount: 8000,
    amount_raised: 0,
    contributor_count: 0,
    sort_order: 1,
  },
  {
    id: '22222222-2222-4222-a222-222222222204',
    category_id: '11111111-1111-4111-a111-111111111102',
    title: 'Romantic Oceanfront Dinners',
    description: 'Candlelight coastal dinners and romantic oceanfront celebrations.',
    image_url:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    type: 'open',
    target_amount: null,
    amount_raised: 0,
    contributor_count: 0,
    sort_order: 2,
  },
  {
    id: '22222222-2222-4222-a222-222222222205',
    category_id: '11111111-1111-4111-a111-111111111103',
    title: 'Date Night & Joy Fund',
    description: 'Concerts, weekend adventures, and sweet dates throughout our first year of marriage.',
    image_url:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    type: 'open',
    target_amount: null,
    amount_raised: 0,
    contributor_count: 0,
    sort_order: 1,
  },
];

export const MOCK_MOMENTS: MomentMedia[] = [
  {
    id: '33333333-3333-4333-a333-333333333301',
    image_url: '/hero/TBC288-8c168739-6060-41c1-b5e3-93b0581aa660.webp',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Elisha & Olivia — Our Journey',
    sort_order: 1,
  },
  {
    id: '33333333-3333-4333-a333-333333333302',
    image_url: '/hero/TBC140-9c898793-a28e-41bb-a3b2-c0f640100ae9.webp',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Quiet moments together',
    sort_order: 2,
  },
  {
    id: '33333333-3333-4333-a333-333333333303',
    image_url: '/hero/TBC171-5be6d6b0-ceb7-45c3-a0ba-d7bb1c37a0d0.webp',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Joy and laughter',
    sort_order: 3,
  },
  {
    id: '33333333-3333-4333-a333-333333333304',
    image_url: '/hero/TBC235-3bba5f4b-b5a2-4db4-bf7a-19d3e72233d4.webp',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Walking side by side',
    sort_order: 4,
  },
  {
    id: '33333333-3333-4333-a333-333333333305',
    image_url: '/hero/TBC244-423318dc-84da-459a-beab-47e134803a4d.webp',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Celebrating our love',
    sort_order: 5,
  },
  {
    id: '33333333-3333-4333-a333-333333333306',
    image_url: '/hero/TBC267-95769264-776e-42ff-8a97-d3d8e19b498f.webp',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Forever begins now',
    sort_order: 6,
  },
  {
    id: '33333333-3333-4333-a333-333333333307',
    image_url: '/hero/TBC77-1e1ed5ff-242f-42b1-82ab-3a5b0b0560b1.webp',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Traditional elegance',
    sort_order: 7,
  },
  {
    id: '33333333-3333-4333-a333-333333333308',
    image_url: '/hero/TBC84-49a49f9e-d683-41a7-97f8-a0905f77cd1f.webp',
    media_type: 'image',
    thumbnail_url: null,
    caption: 'Two hearts, one story',
    sort_order: 8,
  },
];

export const MOCK_CONTRIBUTIONS: Contribution[] = [];
