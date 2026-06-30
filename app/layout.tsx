import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Match Movies",
  description: "Vote em filmes com seus amigos",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Match Movies",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body className="font-poppins bg-[#0f0f1a]">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function setVh() {
                var vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', vh + 'px');
              }
              setVh();
              window.addEventListener('resize', setVh);
              window.addEventListener('orientationchange', function() {
                setTimeout(setVh, 100);
              });
            `,
          }}
        />
        <div
          style={{
            minHeight: "100vh",
            // @ts-expect-error CSS custom property fallback is valid here.
            minHeight: "calc(var(--vh, 1vh) * 100)",
            width: "100%",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            background: 'radial-gradient(ellipse at 50% 30%, #2D1B69 0%, #1A0F3C 40%, #0D0D1A 75%)'
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
