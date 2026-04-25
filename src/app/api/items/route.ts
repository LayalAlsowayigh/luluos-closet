import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { closetItems } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { closetItemSchema } from '@/lib/validators'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await db.select().from(closetItems).where(eq(closetItems.userId, userId)).orderBy(desc(closetItems.createdAt))
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = closetItemSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [item] = await db.insert(closetItems).values({ ...parsed.data, userId }).returning()
  return NextResponse.json(item, { status: 201 })
}
