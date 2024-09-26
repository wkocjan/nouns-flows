import { MenuDesktop, MenuMobile } from "@/components/global/menu"
import { MenuAvatar } from "@/components/global/menu-avatar"
import { ModeToggle } from "@/components/global/mode-toggle"
import { RecipientPopover } from "@/components/global/recipient-popover/recipient-popover"
import { ThemeProvider } from "@/components/global/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getPool } from "@/lib/database/queries/pool"
import Wagmi from "@/lib/wagmi/wagmi-provider"
import Noggles from "@/public/noggles.svg"
import type { Metadata } from "next"
import { Roboto_Mono } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"

const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono" })

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()

  return { title: pool.title, description: pool.tagline }
}

export default async function RootLayout(props: Readonly<{ children: React.ReactNode }>) {
  const { children } = props

  const pool = await getPool()

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${mono.variable} flex h-full flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={350}>
            <Wagmi>
              <nav className="container flex items-center justify-between py-4 md:py-5">
                <h2>
                  <Link
                    href="/"
                    className="flex items-center font-medium text-card-foreground max-sm:text-sm"
                  >
                    <Image src={Noggles} alt={pool.title} className="mr-2.5 h-5 w-auto md:h-7" />
                    {pool.title}
                  </Link>
                </h2>
                <MenuDesktop />
                <div className="flex items-center space-x-2.5">
                  <span className="max-sm:hidden">
                    <ModeToggle />
                  </span>
                  <RecipientPopover />
                  <MenuAvatar />
                  <MenuMobile />
                </div>
              </nav>
              {children}
              <Toaster />
            </Wagmi>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
