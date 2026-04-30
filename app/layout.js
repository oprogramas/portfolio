import { Exo_2, Nunito } from 'next/font/google';
import './globals.css';

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-exo2',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata = {
  title: 'Lucas N. I. — Portfolio',
  description: 'Portfolio de Lucas N. I. — desenvolvimento full-stack com design futurista Frutiger Aero',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${exo2.variable} ${nunito.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
