import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { closetItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { chatMessageSchema } from '@/lib/validators'
import { chatWithStylist } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = chatMessageSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const items = await db.select().from(closetItems).where(eq(closetItems.userId, userId))
  const closetSummary = items.slice(0, 15).map(i => `${i.name} (${i.category})`).join(', ') || 'empty wardrobe'

  const stream = await chatWithStylist(parsed.data.message, parsed.data.history || [], closetSummary)
  return new NextResponse(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
