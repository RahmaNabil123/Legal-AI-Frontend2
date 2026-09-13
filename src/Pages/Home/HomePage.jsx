import Navbar from "../../components/home/Navbar";
import Hero from "../../components/home/Hero";
import TrustStrip from "../../components/home/TrustStrip";
import Features from "../../components/home/Features";
import HowItWorks from "../../components/home/HowItWorks";
import SecuritySection from "../../components/home/SecuritySection";
import FinalCTA from "../../components/home/FinalCTA";
import Footer from "../../components/home/Footer";
import "./HomePage.css";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070A14] text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-blue-500/30 selection:text-blue-900 dark:selection:text-white">
            <Navbar />
            <main>
                <Hero />
                <TrustStrip />
                <Features />
                <HowItWorks />
                <SecuritySection />
                <FinalCTA />
            </main>
            <Footer />
        </div>
    );
}