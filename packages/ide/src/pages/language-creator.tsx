import localFont from "next/font/local";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SpaceBackground } from "@/components/space-background";
import { KeywordCustomizer } from "@/components/keyword-customizer";
import { KeywordProvider } from "@/contexts/keyword/KeywordContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function LanguageCreatorPage() {
  return (
    <div className="relative overflow-hidden">
      <SpaceBackground />
      <Navbar />
      <main
        className={`${geistSans.variable} ${geistMono.variable} relative z-10 min-h-screen p-6 font-(family-name:--font-geist-sans) sm:p-8`}
      >
        <section>
          <KeywordProvider>
            <KeywordCustomizer />
          </KeywordProvider>
        </section>
      </main>
      <Footer />
    </div>
  );
}
