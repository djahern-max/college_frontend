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