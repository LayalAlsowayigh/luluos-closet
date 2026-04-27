import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { calendarOutfits } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json([], { status: 200 })
    const entries = await db.select().from(calendarOutfits).where(eq(calendarOutfits.userId, userId))
    return NextResponse.json(entries)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { date, itemIds, note } = await req.json()
    if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 })
    await db.delete(calendarOutfits).where(
      and(eq(calendarOutfits.userId, userId), eq(calendarOutfits.date, date))
    )
    if (!itemIds || itemIds.length === 0) return NextResponse.json({ success: true })
    const [entry] = await db.insert(calendarOutfits).values({
      userId, date, itemIds, note: note || null,
    }).returning()
    return NextResponse.json(entry)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { date } = await req.json()
    await db.delete(calendarOutfits).where(
      and(eq(calendarOutfits.userId, userId), eq(calendarOutfits.date, date))
    )
    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
