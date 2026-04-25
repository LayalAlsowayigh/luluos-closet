import type { InferSelectModel } from 'drizzle-orm'
import type { closetItems, outfitHistory, chatMessages } from '@/db/schema'

export type ClosetItem = InferSelectModel<typeof closetItems>
export type OutfitHistory = InferSelectModel<typeof outfitHistory>
export type ChatMessage = InferSelectModel<typeof chatMessages>

export type Category = 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Shoes' | 'Accessories' | 'Bags'
export type Occasion = 'Casual' | 'Work' | 'Date Night' | 'Evening Out' | 'Brunch' | 'Gym' | 'Travel' | 'Formal' | 'Interview'
export type Weather = 'Hot' | 'Warm' | 'Mild' | 'Cool' | 'Cold' | 'Rainy'

export type OutfitSuggestion = {
  selectedItems: string[]
  outfitTitle: string
  rationale: string
  stylingTip: string
  colorNarrative: string
}

export type ItemAnalysis = {
  name: string
  category: Category
  color: string
  style: string
  occasions: string[]
  description: string
}
