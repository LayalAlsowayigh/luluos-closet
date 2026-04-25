import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })

const MODELS = {
  female: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=768&q=80&fit=crop',
  male: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=768&q=80&fit=crop',
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { garmentImageBase64, modelType, category } = await req.json()
  if (!garmentImageBase64) return NextResponse.json({ error: 'Missing garment image' }, { status: 400 })

  const humanImageUrl = MODELS[modelType as keyof typeof MODELS] || MODELS.female

  try {
    const output = await replicate.run(
      "subhash25rawat/flux-vton:a02643ce418c0e12bad371c4adbfaec0dd1cb34b034ef37650ef205f92ad6199",
      {
        input: {
            image: humanImageUrl,
            garment: `data:image/jpeg;base64,${garmentImageBase64}`,
            part: category === 'upper_body' ? 'upper_body' : category === 'lower_body' ? 'lower_body' : 'dresses',
          }
      }
    )

    console.log('RAW OUTPUT:', JSON.stringify(output))

    let imageUrl = ''
    if (typeof output === 'string') {
      imageUrl = output
    } else if (Array.isArray(output)) {
      imageUrl = String(output[0])
    } else if (output && typeof output === 'object') {
      imageUrl = String(Object.values(output as Record<string, unknown>)[0])
    }

    console.log('IMAGE URL:', imageUrl)
    return NextResponse.json({ output: imageUrl })

  } catch (error) {
    console.error('Replicate error:', error)
    return NextResponse.json({ error: 'Try-on failed.' }, { status: 500 })
  }
}