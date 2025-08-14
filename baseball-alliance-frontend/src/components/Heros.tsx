import React, { useEffect, useState } from "react";
import heroVideoDesktop from "../assets/BA-Teaser-v4.mov";
import heroVideoMobile from "../assets/BAVert.mp4";
import heroPoster from "../assets/baseballheader.png";

const Hero: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    checkScreen(); // initial check
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return (
    <section className="relative w-screen h-screen overflow-hidden">
      {/* Video layer */}
      <video
        src={isMobile ? heroVideoMobile : heroVideoDesktop}
        poster={heroPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 z-20 w-full h-full object-cover"
      />

      {/* Tint overlay */}
      <div className="absolute inset-0 z-30 bg-black/20 pointer-events-none" />
    </section>
  );
};

export default Hero;
