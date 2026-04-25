import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { closetItems, outfitHistory } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { outfitRequestSchema } from '@/lib/validators'
import { generateOutfit } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = outfitRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const items = await db.select().from(closetItems).where(eq(closetItems.userId, userId))
  if (items.length < 3) return NextResponse.json({ error: 'Add at least 3 items to your wardrobe first.' }, { status: 400 })

  const suggestion = await generateOutfit(items, parsed.data.occasion, parsed.data.weather)

  const [saved] = await db.insert(outfitHistory).values({
    userId,
    title: suggestion.outfitTitle,
    occasion: parsed.data.occasion,
    weather: parsed.data.weather,
    items: suggestion.selectedItems,
    rationale: suggestion.rationale,
    stylingTip: suggestion.stylingTip,
    colorNarrative: suggestion.colorNarrative,
  }).returning()

  return NextResponse.json({ suggestion, saved })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const history = await db.select().from(outfitHistory)
    .where(eq(outfitHistory.userId, userId))
    .orderBy(desc(outfitHistory.createdAt))
    .limit(20)

  return NextResponse.json(history)
}
