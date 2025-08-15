import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import EventSection from "./components/EventSection";
import WhoWeAre from "./components/WhoWeAre";
import Hero from "./components/Heros";
import ContactCTA from "./components/ContactCTA";
import Footer from "./components/Footer";
import TermsAndConditions from "./components/Terms";
import Waiver from "./components/Waiver";
import Privacy from "./components/Privacy";
import ScrollToTop from "./components/ui/ScrollToTop";
import Login from "./components/pages/login";

function Home() {
  return (
    <>
      <Hero />
      <main className="px-4 md:px-16 lg:px-32">
        <EventSection />
        <WhoWeAre />
        <ContactCTA />
      </main>
    </>
  );
}

export default function App() {
  return (
    <div className="relative font-sans min-h-screen text-slate-900 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-[#163968]/30 via-white to-[#ECEDE5]"></div>

      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/30"></div>

      <div className="relative z-10">
        <NavBar />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/waiver" element={<Waiver />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
