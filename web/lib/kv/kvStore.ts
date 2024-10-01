"use server"

import { kv } from "@vercel/kv"

export async function saveItem<T>(key: string, value: T): Promise<void> {
  await kv.set(key, value)
}

export async function getItem<T>(key: string): Promise<T | null> {
  return await kv.get<T>(key)
}

export async function saveIfNotExists(key: string, value: string): Promise<void> {
  const item = await getItem(key)
  if (item) return
  await saveItem(key, value)
}

export async function deleteItem(key: string): Promise<void> {
  await kv.del(key)
}
