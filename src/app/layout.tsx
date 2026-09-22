import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "VoltFit — путь к идеальной форме",
  description:
    "Персонализированные тренировки и трекинг активности в приложении VoltFit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.cookie = "user-tz=" + Intl.DateTimeFormat().resolvedOptions().timeZone + ";path=/;max-age=31536000;SameSite=Lax";`,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
