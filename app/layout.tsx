import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AdSenseScript } from '@/components/ads/adsense-script'
import { AdSenseAutoAds } from '@/components/ads/adsense-auto-ads'
import { Toaster } from '@/components/ui/toaster'
import { APP_CONFIG } from '@/lib/config'
import './globals.css'

export const metadata: Metadata = {
  title: 'PixoraTools - Professional Online Tools Platform',
  description: '300+ professional web tools for PDF, image, QR, code, and SEO tasks. Fast, secure, and free.',
  generator: 'PixoraTools',
  keywords: ['online tools', 'web tools', 'PDF tools', 'image tools', 'QR generator', 'free tools'],
  authors: [{ name: 'PixoraTools' }],
  creator: 'PixoraTools',
  publisher: 'PixoraTools',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixoratools.com',
    siteName: 'PixoraTools',
    title: 'PixoraTools - Professional Online Tools Platform',
    description: '300+ professional web tools for PDF, image, QR, code, and SEO tasks. Fast, secure, and free.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixoraTools - Professional Online Tools Platform',
    description: '300+ professional web tools for PDF, image, QR, code, and SEO tasks. Fast, secure, and free.',
    creator: '@pixoratools',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {APP_CONFIG.enableAds && APP_CONFIG.adsensePublisherId && (
          <AdSenseScript 
            publisherId={APP_CONFIG.adsensePublisherId}
            enableAutoAds={APP_CONFIG.enableAutoAds}
          />
        )}
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Toaster />
        <Analytics />
        {APP_CONFIG.enableAds && <AdSenseAutoAds />}
      </body>
    </html>
  )
}
