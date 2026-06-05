import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import Footer from "../Footer";
import ScrollToTop from "../ui/ScrollToTop";
import ContentEditBanner from "../site-inline/ContentEditBanner";

/** Site chrome: nav, gradients, footer. BAMS auth routes render outside this shell. */
export default function MarketingShell() {
  return (
    <div className="relative font-sans min-h-screen text-slate-900 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial from-[#163968]/30 via-white to-[#ECEDE5]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/30" />

      <NavBar />
      <div className="relative z-0">
        <ContentEditBanner />
        <ScrollToTop />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
