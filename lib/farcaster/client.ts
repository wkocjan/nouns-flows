import { NeynarAPIClient } from "@neynar/nodejs-sdk"
// export type { CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v2/index";
export type { User } from "@neynar/nodejs-sdk/build/neynar-api/v2/index"

export const farcaster = new NeynarAPIClient(`${process.env.NEYNAR_API_KEY}`)
