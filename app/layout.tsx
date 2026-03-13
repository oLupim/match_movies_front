import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tinder dos Filmes",
  description: "Match de filmes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: '#0D0D1A' }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#0D0D1A'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '390px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 30%, #2D1B69 0%, #1A0F3C 40%, #0D0D1A 75%)'
          }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}