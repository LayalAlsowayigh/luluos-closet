import { pgTable, text, boolean, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'

export const categoryEnum = pgEnum('category', ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags'])

export const closetItems = pgTable('closet_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  category: categoryEnum('category').notNull(),
  color: text('color').notNull(),
  style: text('style'),
  description: text('description'),
  occasions: text('occasions').array().default([]),
  imageUrl: text('image_url'),
  imageBase64: text('image_base64'),
  bgRemoved: boolean('bg_removed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const outfitHistory = pgTable('outfit_history', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  occasion: text('occasion').notNull(),
  weather: text('weather').notNull(),
  items: text('items').array().notNull(),
  rationale: text('rationale'),
  stylingTip: text('styling_tip'),
  colorNarrative: text('color_narrative'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
