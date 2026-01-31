import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Chat SaaS Admin",
  description: "Admin panel for Chat SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
