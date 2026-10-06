import type { Metadata } from 'next';
import './globals.css';
import { PersonaProvider } from '@/context/PersonaContext';

export const metadata: Metadata = {
  title: 'مِشكاتي 🇵🇸 | رفيق الطالب الفلسطيني في دراسته وعبادته',
  description: 'منصة تفاعلية متكاملة تجمع بين تنظيم مواقيت الصلاة، الأوراد اليومية، مضمار التركيز والإنجاز، والمساعد الأكاديمي الذكي سِراج.',
  icons: {
    icon: '/icon-192.png'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Tajawal:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen selection:bg-amber-500/30 selection:text-amber-200">
        <PersonaProvider>
          {children}
        </PersonaProvider>
      </body>
    </html>
  );
}
