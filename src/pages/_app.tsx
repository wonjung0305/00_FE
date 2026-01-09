import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/authStore";
import { Noto_Sans_KR } from "next/font/google";

const notoSansKr = Noto_Sans_KR({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  const checkLoginFromUrl = useAuthStore((s) => s.checkLoginFromUrl);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkLoginFromUrl();
  }, [checkLoginFromUrl]);

  if (!isMounted) return null;

  return (
    <main className={notoSansKr.className}>
      <Header />
      <Component {...pageProps} />
    </main>
  );
}
