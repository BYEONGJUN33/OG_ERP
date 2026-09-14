import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오픈가든 포털",
  description: "오픈가든 사내 포털",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {children}
        {/* 카드를 눌러 연 할 일 창이 여기 뜬다. 평소에는 비어 있다. */}
        {modal}
      </body>
    </html>
  );
}
