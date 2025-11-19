import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customs AI Assistants | The Trade Lab",
  description: "Multi-country customs AI assistants powered by ElevenLabs. Get instant answers about customs regulations, tariff classification, and trade compliance in multiple languages.",
  keywords: "customs, trade compliance, HTS classification, tariff, import regulations, export regulations, customs broker, AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
