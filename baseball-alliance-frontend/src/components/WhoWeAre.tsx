import React, { useState } from "react";
import BA1 from "../assets/ba1.png";
import BA2 from "../assets/ba2.png";
import BA3 from "../assets/ba3.png";
import CardCarousel from "./ui/carousel";

type ImageCardProps = {
  title: string;
  description: string;
  imageUrl: string;
};

const ImageCard: React.FC<ImageCardProps> = ({
  title,
  description,
  imageUrl,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false); // for mobile tap

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    setTilt({ x, y });
  };

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={() => {
        setTilt({ x: 0, y: 0 });
        setOpen(false);
      }}
      onClick={() => setOpen((s) => !s)} // tap toggles desc on touch
      style={{
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
      }}
      className="relative overflow-hidden rounded-2xl group shadow-[0_10px_30px_rgba(0,0,0,.25)] transition-transform duration-300 ease-out cursor-pointer"
    >
      {/* Glow border */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300">
        <div className="absolute -inset-px rounded-2xl animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ef4444_0%,#ffffff_25%,#ef4444_50%,#ffffff_75%,#ef4444_100%)] opacity-50" />
      </div>

      {/* Image */}
      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Stronger gradient overlay for readability */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

      {/* Title (always at bottom before hover) */}
      <div className="absolute left-4 right-4 bottom-3 text-white">
        <h3
          className={[
            "font-semibold leading-snug drop-shadow-md",
            "transition-opacity duration-300",
            "group-hover:opacity-0 md:group-hover:opacity-0",
            open ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          {title}
        </h3>
      </div>

      {/* Description panel – glass, larger text, better contrast */}
      <div
        className={[
          "absolute left-3 right-3 bottom-3",
          "rounded-xl px-4 py-3",
          "bg-white/10 backdrop-blur-md ring-1 ring-white/15",
          "text-white text-[0.925rem] leading-snug",
          "shadow-[0_6px_20px_rgba(0,0,0,0.35)]",
          "transition-all duration-300",
          // hover on desktop, tap on mobile
          "opacity-0 translate-y-2",
          "md:group-hover:opacity-100 md:group-hover:translate-y-0",
          open ? "opacity-100 translate-y-0" : "",
        ].join(" ")}
      >
        <p className="[text-shadow:_0_1px_2px_rgba(0,0,0,0.55)]">
          {description}
        </p>
      </div>
    </div>
  );
};

const WhoWeAre: React.FC = () => {
  const items = [
    {
      id: 1,
      title: "Invite-Only Alliance Top Select Teams",
      description:
        "Continuously improving the landscape of clinics, tournaments and showcases is essential to our effectiveness, and we will always hold ourselves to the highest level of accountability.",
      image: BA1,
    },
    {
      id: 2,
      title: "Elite Tournaments & Individual Showcases",
      description:
        "Who provides instruction, what values guide decisions, when to practice, play and learn, where to compete and get seen, and how to navigate development, metrics, recruiting, pro avenues, transfer portal, NIL, media and representation — all matter.",
      image: BA2,
    },
    {
      id: 3,
      title: "Athlete Education Workshops & Guides",
      description:
        "We facilitate a beneficial, thoughtful and candid understanding of the best information — and present solutions in that context for our members and supporters.",
      image: BA3,
    },
  ];

  return (
    <section
      id="about us"
      className={[
        "relative mx-auto max-w-7xl px-4 lg:px-0 mt-16",
        // subtle background flair behind the section
        "before:absolute before:inset-0 before:-z-10",
        // "before:bg-[radial-gradient(60%_40%_at_20%_20%,rgba(22,57,104,0.12),transparent_70%)]",
      ].join(" ")}
    >
      {/* Eyebrow + Heading */}
      <div className="mb-2">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#163968]/80">
          About Baseball Alliance
        </span>
        <h2 className="mt-2 text-3xl md:text-4xl text-[#163968] font-extrabold tracking-tight">
          Who We Are
        </h2>
      </div>

      {/* Accent divider */}
      <div className="h-[3px] w-24 bg-gradient-to-r from-[#163968] via-[#3b82f6] to-[#ef4444] rounded-full mb-6" />

      {/* Lead + supporting intro (kept verbatim line first) */}
      <div className="md:pr-6 md:max-w-6xl">
        <p className="text-[#1E1E1E] text-2xl leading-7 mb-4">
          <strong>
            Baseball Alliance exists to unite exemplary youth baseball teams,
            providing member organizations with the tools, exposure and support
            to take their athletes to the next level – college or professional.
          </strong>
        </p>
        <p className="text-[#1E1E1E]/90 leading-7">
          Baseball Alliance is a partnership that exists for the purpose of
          facilitating productive opportunities for players, coaches,
          organizations and families. The sport is in a rapidly evolving state
          of change, and Baseball Alliance was formed to align credible teams
          and people focused on promising pathways and preparing
          student-athletes for successful futures.
        </p>
      </div>

      {/* Cards grid */}
      <div className="mt-10 grid items-start gap-8 md:grid-cols-[380px,1fr]">
        {/* Spacer column to keep the asymmetry feel */}
        <div className="hidden md:block" />

        <div>
          {/* Desktop 3-up */}
          <div className="hidden sm:grid grid-cols-3 gap-6">
            {items.map((item) => (
              <ImageCard
                key={item.id}
                title={item.title}
                description={item.description}
                imageUrl={item.image}
              />
            ))}
          </div>

          {/* Mobile horizontal scroll (titles visible; tap reveals desc) */}
          <div className="sm:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory no-scrollbar">
            <CardCarousel
              items={items.map((i) => ({
                id: i.id,
                title: i.title,
                image: i.image,
                description: i.description,
              }))}
              cardPercent={82}
            />
            <p className="mt-3 text-xs text-gray-600">
              Tap a card to read more.
            </p>
          </div>
        </div>
      </div>

      {/* Value strip (lightweight, no new components) */}
      {/* <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Player‑First Pathways:</span>{" "}
            development, exposure, and decisions rooted in long‑term growth.
          </p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Credible Events:</span> clinics,
            tournaments, showcases — held to measurable standards.
          </p>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
          <p className="text-sm text-gray-800">
            <span className="font-semibold">Clarity & Education:</span> metrics,
            recruiting, NIL, transfer portal, pro avenues, and media.
          </p>
        </div>
      </div> */}

      {/* Concluding statement */}
      <div className="mt-10 rounded-2xl bg-[#163968]/5 p-6 ring-1 ring-[#163968]/10">
        <p className="text-[#1E1E1E] leading-7">
          <strong>The bottom line:</strong> We prioritize quality over
          one‑size‑fits‑all baseball. This is about kids’ journeys, not cattle.
          Our mandate is to make a difference for the better and respect the
          realities families, players and teams face year‑round, on and off the
          fields. Baseball Alliance is interested in one outcome:{" "}
          <em>Baseball Alliance. Creating Better Results.</em>
        </p>
      </div>
    </section>
  );
};

export default WhoWeAre;
