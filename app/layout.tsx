import type React from "react"
import { Arima as Arial } from "next/font/google"
import "./globals.css"

const arial = Arial({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-arial",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${arial.variable} antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
