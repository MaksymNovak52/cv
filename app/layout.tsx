import { Metadata } from "next";
import { EB_Garamond, Miriam_Libre } from "next/font/google";
import "./globals.css";

const miriamLibre = Miriam_Libre({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"],
  preload: true,
  variable: "--font-eb-miriamLibre",
});
const ebGaramond = EB_Garamond({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"],
  variable: "--font-eb-garamond",
});

export const metadata: Metadata = {
  title: "Rare Minds",
  description: "Rare Minds rare minds isn’t a talent pool. It’s an access key",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/brain-128.ico",
        href: "/brain-128.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/brain-128.ico",
        href: "/brain-128.ico",
      },
    ],
    apple: "/brain-128.ico",
  },
  openGraph: {
    title: "Rare Minds",
    description:
      "Rare Minds rare minds isn’t a talent pool. It’s an access key",
    url: "https://yourdomain.com",
    siteName: "Rare Minds",
    images: [
      {
        url: "/brain-128.ico",
        width: 128,
        height: 128,
        alt: "Rare Minds Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rare Minds",
    description:
      "Rare Minds rare minds isn’t a talent pool. It’s an access key",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, viewport-fit=cover"
      />
      <head>
        <meta property="og:title" content="Rare Minds" />
        <meta
          property="og:description"
          content="Rare Minds rare minds isn’t a talent pool. It’s an access key"
        />
        <meta property="og:image" content="/brain-128.ico" />
        <meta property="og:url" content="https://yourdomain.com" />{" "}
        {/* Заміни на свій домен */}
        <meta name="twitter:title" content="Rare Minds" />
        <meta
          name="twitter:description"
          content="Rare Minds rare minds isn’t a talent pool. It’s an access key"
        />
        <meta name="twitter:image" content="/brain-128.ico" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>

      <body
        className={`antialiased ${miriamLibre.variable} ${ebGaramond.variable}`}
        style={{
          background: "#E6E5E3",
        }}
      >
        {children}
      </body>
    </html>
  );
}
