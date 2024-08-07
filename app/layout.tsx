import { ModeToggle } from "@/components/mode-toggle"
import { ThemeProvider } from "@/components/theme-provider"
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
          <nav className="border-border bg-card border-b py-3.5">
            <div className="container flex items-center justify-between">
              <h2 className="flex items-center font-bold">
                <Image
                  src={Noggles}
                  alt="Nouns DAO Grants"
                  className="mr-2.5 h-8 w-auto"
                />
                Nouns Grants
              </h2>
              <ModeToggle />
            </div>
          </nav>
          {children}
          <footer className="mt-12"></footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
