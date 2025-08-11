import React from "react";
import NavBar from "./components/NavBar";
import EventSection from "./components/EventSection";
import WhoWeAre from "./components/WhoWeAre";
import Hero from "./components/Heros";
import ContactCTA from "./components/ContactCTA";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="font-sans text-white bg-[#ECEDE5]">
      <NavBar />
      <Hero />
      <main className="px-4 md:px-16 lg:px-32">
        <EventSection />
        <WhoWeAre />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
