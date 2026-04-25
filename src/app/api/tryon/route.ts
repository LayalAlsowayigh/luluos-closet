import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const FEMALE_MODEL_URL = 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=768&q=80&fit=crop'
const MALE_MODEL_URL = 'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=768&q=80&fit=crop'

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { garmentImageBase64, modelType, category } = await req.json()
  if (!garmentImageBase64) return NextResponse.json({ error: 'Missing garment image' }, { status: 400 })

  const fashnCategory = category === 'lower_body' ? 'bottoms' : category === 'dresses' ? 'one-pieces' : 'tops'
  const modelUrl = modelType === 'male' ? MALE_MODEL_URL : FEMALE_MODEL_URL

  try {
    // Convert model image to base64
    const modelBase64 = await urlToBase64(modelUrl)
    console.log('Model image fetched, sending to Fashn...')

    const startRes = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.FASHN_API_KEY}` },
      body: JSON.stringify({
        model_name: 'tryon-v1.6',
        inputs: {
          model_image: `data:image/jpeg;base64,${modelBase64}`,
          garment_image: `data:image/jpeg;base64,${garmentImageBase64}`,
          category: fashnCategory,
        },
      }),
    })

    const startData = await startRes.json()
    console.log('Fashn start:', JSON.stringify(startData))
    if (!startRes.ok || !startData.id) return NextResponse.json({ error: startData.message || 'Failed' }, { status: 500 })

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000))
      const statusRes = await fetch(`https://api.fashn.ai/v1/status/${startData.id}`, {
        headers: { 'Authorization': `Bearer ${process.env.FASHN_API_KEY}` },
      })
      const statusData = await statusRes.json()
      console.log('Status:', statusData.status, JSON.stringify(statusData.error || ''))
      if (statusData.status === 'completed' && statusData.output?.length > 0) {
        return NextResponse.json({ output: statusData.output[0] })
      }
      if (statusData.status === 'failed') {
        return NextResponse.json({ error: `Failed: ${statusData.error?.message}` }, { status: 500 })
      }
    }
    return NextResponse.json({ error: 'Timed out' }, { status: 500 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
