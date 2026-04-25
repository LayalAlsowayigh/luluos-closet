import { z } from 'zod'

export const closetItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: z.enum(['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags']),
  color: z.string().min(1, 'Color is required').max(50),
  style: z.string().max(50).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  occasions: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional().nullable(),
  imageBase64: z.string().optional().nullable(),
  bgRemoved: z.boolean().optional(),
})

export const outfitRequestSchema = z.object({
  occasion: z.string().min(1),
  weather: z.string().min(1),
})

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
})

export const analyzeItemSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.string().min(1),
})
