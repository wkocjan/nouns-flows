import { ConnectWalletButton } from "@/components/global/connect-wallet-button"
import { MenuDesktop, MenuMobile } from "@/components/global/menu"
import { ModeToggle } from "@/components/global/mode-toggle"
import { ThemeProvider } from "@/components/global/theme-provider"
import Wagmi from "@/lib/wagmi/wagmi-provider"
import Noggles from "@/public/noggles.svg"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Image from "next/image"
import Link from "next/link"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Nouns Flows",
  description: "Protocol for streaming funds to Nouns builders",
}

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>,
) {
  const { children } = props

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.variable} flex h-full flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Wagmi>
            <nav className="container flex items-center justify-between py-4 md:py-5">
              <h2>
                <Link
                  href="/"
                  className="flex items-center font-medium text-card-foreground max-sm:text-sm"
                >
                  <Image
                    src={Noggles}
                    alt="Nouns Flows"
                    className="mr-2.5 h-5 w-auto md:h-7"
                  />
                  Nouns Flows
                </Link>
              </h2>
              <MenuDesktop />
              <div className="flex items-center space-x-2.5">
                <span className="max-sm:hidden">
                  <ModeToggle />
                </span>
                <ConnectWalletButton />
                <MenuMobile />
              </div>
            </nav>
            {children}
          </Wagmi>
        </ThemeProvider>
      </body>
    </html>
  )
}
