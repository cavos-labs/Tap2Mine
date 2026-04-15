import type { Metadata, Viewport } from "next";
import { CavosSiteFooter } from "@/components/cavos-site-footer";
import { CoffeeRainBackground } from "@/components/coffee-rain-background";
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
  description:
    "Toca rápido, mina BTC imaginario y sube en la clasificación. / Tap fast, mine imaginary BTC, climb the leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${romagothicbold.variable} ${geist.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <div id="app-shell" className="relative flex min-h-screen flex-col overflow-x-hidden bg-white transition-colors duration-500">
          <CoffeeRainBackground />
          <Providers>
            <div className="relative z-10 flex flex-1 flex-col">{children}</div>
            <CavosSiteFooter />
          </Providers>
        </div>
      </body>
    </html>
  );
}
