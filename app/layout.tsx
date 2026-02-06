import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Robert Task Manager",
  description: "Task and communication manager for Robert + User collaboration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
