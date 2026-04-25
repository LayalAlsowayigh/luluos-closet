import OpenAI from 'openai'
import type { ClosetItem, OutfitSuggestion, ItemAnalysis } from '@/types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function analyzeClothingPhoto(imageBase64: string, mimeType: string): Promise<ItemAnalysis> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        { type: 'text', text: 'Analyze this clothing item. Respond ONLY with valid JSON (no markdown): {"name":"descriptive item name","category":"one of: Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories, Bags","color":"primary color or pattern","style":"one-word aesthetic","occasions":["casual"],"description":"2 sentence description"}' }
      ]
    }],
    max_tokens: 1024,
  })
  const text = response.choices[0].message.content || ''
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

export async function generateOutfit(items: ClosetItem[], occasion: string, weather: string): Promise<OutfitSuggestion> {
  const itemList = items.map((i, idx) => `${idx + 1}. ${i.name} (${i.category}, ${i.color})`).join('\n')
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `You are a stylist. Select 3-4 items for "${occasion}" in ${weather} weather.\n\nWardrobe:\n${itemList}\n\nRespond ONLY with valid JSON:\n{"selectedItems":["item1","item2","item3"],"outfitTitle":"title","rationale":"one sentence","stylingTip":"one tip","colorNarrative":"one sentence"}`
    }],
    max_tokens: 800,
  })
  const text = response.choices[0].message.content || ''
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}

export async function chatWithStylist(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  closetSummary: string
): Promise<ReadableStream> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: `You are a personal stylist for Luluo's Closet. Be elegant and direct. No emojis. Wardrobe: ${closetSummary}. Max 100 words.` },
    ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: message }
  ]
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 600,
    stream: true,
    messages,
  })
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        if (text) controller.enqueue(new TextEncoder().encode(text))
      }
      controller.close()
    }
  })
}
