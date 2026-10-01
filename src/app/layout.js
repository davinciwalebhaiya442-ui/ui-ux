import "./globals.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://davinciwalebhaiya.com'),
  title: { default: "DavinciWaleBhaiya — Tools for Colorists & Editors", template: "%s | DavinciWaleBhaiya" },
  description: "Premium tools, presets, effects and editorial resources for working colorists and editors.",
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  alternates: { canonical: '/' },
  openGraph: { title: 'DavinciWaleBhaiya', description: 'Tools for working colorists and editors.', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'DavinciWaleBhaiya', description: 'Tools for working colorists and editors.' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'DavinciWaleBhaiya', url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' }) }} /></body>
    </html>
  );
}
