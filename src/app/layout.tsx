import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AstroFarm - Sustainable Agriculture Simulation',
  description: 'Learn sustainable farming practices using real NASA satellite data',
  keywords: ['agriculture', 'sustainability', 'NASA', 'education', 'simulation'],
  authors: [{ name: 'AstroFarm Team' }],
  openGraph: {
    title: 'AstroFarm - Sustainable Agriculture Simulation',
    description: 'Learn sustainable farming practices using real NASA satellite data',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* DNS prefetch for Mapbox */}
        <link 
          rel="dns-prefetch" 
          href="//api.mapbox.com"
        />
        <link 
          rel="dns-prefetch" 
          href="//fonts.googleapis.com"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-farm-green to-farm-blue">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

