import { Routes, Route } from "react-router-dom";
import EventSection from "./components/EventSection";
import WhoWeAre from "./components/WhoWeAre";
import Hero from "./components/Heros";
import ContactCTA from "./components/ContactCTA";
import TermsAndConditions from "./components/Terms";
import MarketingShell from "./components/layout/MarketingShell";
import Waiver from "./components/Waiver";
import Privacy from "./components/Privacy";
import Leadership from "./components/Leadership";
import Membership from "./components/Membership";
import InstagramFeed from "./components/InstagramFeed";
import Login from "./components/pages/login";
import AdminSiteEditor from "./components/admin/AdminSiteEditor";
import AdminEventsPage from "./components/admin/AdminEventsPage";
/* Page builder + public CMS page routes — paused; expand later.
import AdminPagesIndex from "./components/admin/AdminPagesIndex";
import AdminPageEditor from "./components/admin/AdminPageEditor";
import CmsPageView from "./components/cms/CmsPageView";
*/
import BamsApp from "./components/bams/BamsApp";
import BamsAuthCallback from "./components/bams/BamsAuthCallback";
import BamsLoginPage from "./components/bams/BamsLoginPage";
import BamsProtectedRoute from "./components/bams/BamsProtectedRoute";
import AdminUsersImportPage from "./components/admin/AdminUsersImportPage";

function Home() {
  return (
    <>
      <Hero />
      <main className="px-4 md:px-16 lg:px-32">
        <EventSection />
        <WhoWeAre />
        <ContactCTA />
        <InstagramFeed />
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/bams/login" element={<BamsLoginPage />} />
      <Route path="/bams/auth/callback" element={<BamsAuthCallback />} />
      <Route element={<MarketingShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/waiver" element={<Waiver />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/bams"
          element={
            <BamsProtectedRoute>
              <BamsApp />
            </BamsProtectedRoute>
          }
        />
        <Route path="/admin/users" element={<AdminUsersImportPage />} />
        {/* Page builder paused — re-import CmsPageView + AdminPages* and restore routes */}
        {/* <Route path="/pages/:slug" element={<CmsPageView />} /> */}
        <Route path="/admin/site" element={<AdminSiteEditor />} />
        <Route path="/admin/events" element={<AdminEventsPage />} />
        {/* <Route path="/admin/pages" element={<AdminPagesIndex />} /> */}
        {/* <Route path="/admin/pages/:slug" element={<AdminPageEditor />} /> */}
        <Route path="/leadership" element={<Leadership />} />
        <Route path="/membership" element={<Membership />} />
      </Route>
    </Routes>
  );
}
