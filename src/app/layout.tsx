import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ProfileProvider } from '@/context/ProfileContext';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MagicScholar.com - The One Place to Find Scholarships',
  description: 'Discover, apply, and win scholarships from thousands of universities and organizations. Your education funding journey starts here.',
  keywords: 'scholarships, college funding, financial aid, education, universities, campus, student resources',

  // Open Graph tags (for link previews)
  openGraph: {
    title: 'MagicScholar - The One Place to Find Scholarships',
    description: 'Discover, apply, and win scholarships from thousands of universities and organizations. Your education funding journey starts here.',
    url: 'https://www.magicscholar.com',
    siteName: 'MagicScholar',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MagicScholar - Scholarship Discovery Platform 🪄🎓',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    title: 'MagicScholar - The One Place to Find Scholarships',
    description: 'Discover, apply, and win scholarships from thousands of universities and organizations.',
    images: ['/og-image.jpg'],
    creator: '@magicscholar', // Update with your actual Twitter handle
  },

  // Favicon and app icons
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#3b82f6',
      },
    ],
  },

  // Web app manifest
  manifest: '/site.webmanifest',

  // Theme colors
  themeColor: '#1f2937',

  // Additional meta tags
  applicationName: 'MagicScholar',
  authors: [{ name: 'MagicScholar Team' }],
  creator: 'MagicScholar',
  publisher: 'MagicScholar',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ProfileProvider>
            <Layout>
              {children}
            </Layout>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}