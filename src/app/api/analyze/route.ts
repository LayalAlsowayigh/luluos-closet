import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { analyzeClothingPhoto } from '@/lib/ai'
import { analyzeItemSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = analyzeItemSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const analysis = await analyzeClothingPhoto(parsed.data.imageBase64, parsed.data.mimeType)
  return NextResponse.json(analysis)
}
