import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "neffy® — Epinephrine Nasal Spray Intake",
  description: "Medical intake questionnaire for neffy® (epinephrine nasal spray) — the needle-free emergency treatment for anaphylaxis.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          async
          defer
        />
      </head>
      <body className="min-h-screen bg-white antialiased font-sans">{children}</body>
    </html>
  );
}
