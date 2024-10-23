"use server"

import Mux from "@mux/mux-node"

const mux = new Mux({
  tokenId: process.env["MUX_TOKEN_ID"],
  tokenSecret: process.env["MUX_TOKEN_SECRET"],
})

export async function uploadVideo(url: string) {
  const asset = await mux.video.assets.create({ input: [{ url }], playback_policy: ["public"] })

  const playbackId = asset.playback_ids?.[0]?.id
  if (!playbackId) throw new Error("No playback ID found")

  return `https://stream.mux.com/${playbackId}.m3u8`
}
