import useSWR from 'swr'
import type { ClosetItem } from '@/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useCloset() {
  const { data, error, isLoading, mutate } = useSWR<ClosetItem[]>('/api/items', fetcher)

  async function addItem(item: Omit<ClosetItem, 'id' | 'userId' | 'createdAt'>) {
    await fetch('/api/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    mutate()
  }

  async function deleteItem(id: string) {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    mutate()
  }

  return { closet: data || [], isLoading, error, addItem, deleteItem, mutate }
}
