import React, { useState } from "react";
import BA1 from "../assets/ba1.png";
import BA2 from "../assets/ba2.png";
import BA3 from "../assets/ba3.png";
import CardCarousel from "./ui/carousel";

type ImageCardProps = {
  title: string;
  imageUrl: string;
};

const ImageCard: React.FC<ImageCardProps> = ({ title, imageUrl }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    setTilt({ x, y });
  };

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
      }}
      className="relative overflow-hidden rounded-2xl group shadow-[0_10px_30px_rgba(0,0,0,.25)] transition-transform duration-300 ease-out"
    >
      {/* Glow border */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="absolute -inset-px rounded-2xl animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff0000_0%,#ffffff_25%,#ff0000_50%,#ffffff_75%,#ff0000_100%)] opacity-60" />
      </div>

      {/* Image */}
      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent rounded-2xl" />

      {/* Title */}
      <div className="absolute left-4 right-4 bottom-3">
        <h3 className="text-white font-semibold leading-snug drop-shadow-md">
          {title}
        </h3>
      </div>
    </div>
  );
};

const WhoWeAre: React.FC = () => {
  const items = [
    { id: 1, title: "Invite-Only Alliance Top Select Teams", image: BA1 },
    { id: 2, title: "Elite Tournaments & Player Development", image: BA2 },
    { id: 3, title: "Athlete Education Workshops & Guides", image: BA3 },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-0 mt-16">
      <div className="grid items-start gap-8 md:grid-cols-[380px,1fr]">
        {/* Text column */}
        <div className="pr-2">
          <h2 className="text-2xl text-[#163968] font-bold uppercase tracking-wide mb-4">
            Who We Are
          </h2>
          <p className="text-[#1E1E1E] leading-7">
            Baseball Alliance exists to unite the best youth baseball teams,
            providing member organizations with the tools, exposure and support
            to take their athletes to the next level – college or professional.
          </p>
        </div>

        {/* Cards column */}
        <div>
          {/* Desktop 3-up */}
          <div className="hidden sm:grid grid-cols-3 gap-6">
            <ImageCard
              title="Invite-Only Alliance Top Select Teams"
              imageUrl={BA1}
            />
            <ImageCard title="Elite Tournaments & Development" imageUrl={BA2} />
            <ImageCard
              title="Athlete Education Workshops & Guides"
              imageUrl={BA3}
            />
          </div>

          {/* Mobile horizontal scroll */}
          <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory no-scrollbar">
            <CardCarousel items={items} cardPercent={82} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;
