import { Geist, Geist_Mono } from "next/font/google";

import ShortenForm from "../components/ShortenForm";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function Home() {

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 12 }}>
        URL Shortener (x402 Powered)
      </h1>

      <p style={{ marginBottom: 32, color: "#555" }}>
        Pay a tiny fee, get a permanent short URL stored on Base Sepolia.
      </p>


        <ShortenForm />
    </div>
  );
}
