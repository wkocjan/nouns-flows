import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"
import Wagmi from "@/lib/wagmi/wagmi-provider"
import Noggles from "@/public/noggles.svg"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Image from "next/image"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Nouns Grants",
  description: "Nouns Grants project",
}

export default function RootLayout(
  props: Readonly<{ children: React.ReactNode }>,
) {
  const { children } = props
  return (
    <html lang="en">
      <body className={inter.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Wagmi>
            <nav className="bg-card py-3.5">
              <div className="container flex items-center justify-between">
                <h2 className="flex items-center font-medium text-card-foreground">
                  <Image
                    src={Noggles}
                    alt="Nouns DAO Grants"
                    className="mr-2.5 h-8 w-auto"
                  />
                  Nouns Grants
                </h2>
                <div className="flex items-center space-x-2.5">
                  <ModeToggle />
                  <ConnectWalletButton />
                </div>
              </div>
            </nav>
            {children}
            <footer className="mt-12"></footer>
          </Wagmi>
        </ThemeProvider>
      </body>
    </html>
  )
}
