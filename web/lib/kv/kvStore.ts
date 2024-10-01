"use server"

import { kv } from "@vercel/kv"

export async function saveItem<T>(key: string, value: T): Promise<void> {
  await kv.set<T>(key, value)
}

export async function getItem<T>(key: string): Promise<T | null> {
  return await kv.get<T>(key)
}

export async function saveOrGet<T>(key: string, value: T): Promise<T> {
  const item = await getItem<T>(key)
  if (item) return item
  await saveItem(key, value)
  return value
}

export async function deleteItem(key: string): Promise<void> {
  await kv.del(key)
}
