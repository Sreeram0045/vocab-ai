import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VocabulAI - Master Words Through Cinema",
  description: "Level up your vocabulary with AI-generated scenarios from your favorite TV shows.",
  openGraph: {
    title: "VocabulAI - Master Words Through Cinema",
    description: "Level up your vocabulary with AI-generated scenarios from your favorite TV shows.",
    url: "https://vocabulai.vercel.app",
    siteName: "VocabulAI",
    images: [
      {
        url: "/og-image.png", // Ensure this exists in public/ folder (1200x630px)
        width: 1200,
        height: 630,
        alt: "VocabulAI Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VocabulAI - Master Words Through Cinema",
    description: "Level up your vocabulary with AI-generated scenarios from your favorite TV shows.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
