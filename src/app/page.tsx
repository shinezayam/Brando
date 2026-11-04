import { I18nProvider } from '@/i18n';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <I18nProvider>
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <HowItWorks />
        <Features />
        <FAQ />
        <Footer />
      </main>
    </I18nProvider>
  );
}
