import type { Metadata, Viewport } from "next";
import { CavosSiteFooter } from "@/components/cavos-site-footer";
import { Providers } from "@/components/providers";
import { geist, romagothicbold } from "@/lib/fonts";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Tap2Mine",
  description: "Tap fast, mine imaginary BTC, and climb the leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${romagothicbold.variable} ${geist.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <div className="flex min-h-screen flex-col bg-white">
          <Providers>
            <div className="flex flex-1 flex-col">{children}</div>
          </Providers>
          <CavosSiteFooter />
        </div>
      </body>
    </html>
  );
}
