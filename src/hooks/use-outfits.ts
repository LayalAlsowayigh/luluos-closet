import useSWR from 'swr'
import type { OutfitHistory } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useOutfits() {
  const { data, isLoading, mutate } = useSWR<OutfitHistory[]>('/api/outfits', fetcher)

  async function generateOutfit(occasion: string, weather: string) {
    const res = await fetch('/api/outfits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ occasion, weather }) })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
    const data = await res.json()
    mutate()
    return data.suggestion
  }

  return { history: data || [], isLoading, generateOutfit, mutate }
}
