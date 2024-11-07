import { headers } from "next/headers"

export function getLocationPrompt(): string {
  const country = headers().get("X-Vercel-IP-Country")
  const countryRegion = headers().get("X-Vercel-IP-Country-Region")
  const city = headers().get("X-Vercel-IP-City")

  if (!city && !country && !countryRegion) return ""

  return `Here is the user's location: ${city}, ${country}, ${countryRegion} from geolocation. If the user is not in the US or English speaking country, feel free to ask questions in their language. At the start, you may want to ask user which language they prefer in conversation with you. In the same message do not ask more questions - let the user first pick the language. Do not mention you know the city - it may be not accurate.`
}
