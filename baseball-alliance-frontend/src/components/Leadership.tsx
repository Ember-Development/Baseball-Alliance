import React, { useState, useEffect } from "react";
import JohnImage from "../assets/leadership/John.png";
import BillImage from "../assets/leadership/Bill.png";
import KeithImage from "../assets/leadership/Keith.png";
import EddieCornblumImage from "../assets/leadership/Eddie Cornblum.png";
import JohnLindsleyVideo from "../assets/leadership/John Lindsley BA.mov";
import EddieVideo from "../assets/leadership/Eddie Video.mov";

type LeaderProfile = {
  id: string;
  name: string;
  title: string;
  shortBio: string;
  fullBio: string;
  image?: string;
  videoUrl?: string;
};

type StatItem = {
  highlight: string;
  description: string;
};

type VideoItem = {
  id: string;
  title: string;
  name: string;
  description: string;
  videoUrl: string;
  category: string;
  posterImage?: string;
};

const Leadership: React.FC = () => {
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const toggleBio = (id: string) => {
    setExpandedBios((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openVideoModal = (video: VideoItem) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isVideoModalOpen) {
        closeVideoModal();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isVideoModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVideoModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVideoModalOpen]);

  const stats: StatItem[] = [
    {
      highlight: "100+ Years",
      description:
        "Of Baseball Leadership across MLB, high school, and amateur levels",
    },
    {
      highlight: "40+ Years",
      description:
        "In MLB Front Offices including Angels, Mariners, Dodgers, Reds, and the MLB Commissioner's Office",
    },
    {
      highlight: "63 MLB Draft Picks",
      description: "Developed through Baseball Alliance Leadership",
    },
    {
      highlight: "636+ College Commitments",
      description: "Under Baseball Alliance Leadership",
    },
    {
      highlight: "400+ Career Wins",
      description:
        "High School Coaching Wins led by Eddie Cornblum, including the 2025 6A State Championship",
    },
  ];

  const videos: VideoItem[] = [
    {
      id: "john-lindsley-video",
      title: "John Lindsley - Partner",
      name: "John Lindsley",
      description:
        "Hear from John Lindsley about his vision for Baseball Alliance.",
      videoUrl: JohnLindsleyVideo,
      category: "Leadership Interview",
      posterImage: JohnImage,
    },
    {
      id: "eddie-cornblum-video",
      title: "Eddie Cornblum - Field Coordinator",
      name: "Eddie Cornblum",
      description:
        "Eddie Cornblum shares insights on player development and coaching excellence.",
      videoUrl: EddieVideo,
      category: "Coaching Spotlight",
      posterImage: EddieCornblumImage,
    },
  ];

  const leadership: LeaderProfile[] = [
    {
      id: "john-lindsley",
      name: "John Lindsley",
      title: "Partner",
      shortBio:
        "John is a seasoned business leader with 25 years of experience in real estate development, banking, and investment management. He played a key role in creating Utah's first Sports Mixed-Use Zone and developing a Major League Soccer training facility. Today he leads IV Development Partners and is an equity partner in Goatnet.",
      fullBio: `John is a distinct professional with 25 years of experience as a real estate developer, commercial banker, and business manager. After a 15-year career in banking, he spent 10 years as Executive VP of Development and Partner at Wasatch Properties in Logan, Utah. While there, he managed development and venture investments and originated over $1B in debt guarantees for Wasatch Guaranty Capital.
      
He facilitated the acquisition and development of a first-of-its-kind Major League Soccer training facility while helping create Utah's first Sports Mixed-Use Zone.

John is also an equity partner with the sports marketing firm Goatnet and currently serves as Managing Partner of IV Development Partners, along with several other ventures.`,
      image: JohnImage,
    },
    {
      id: "bill-bavasi",
      name: "Bill Bavasi",
      title: "Partner",
      shortBio:
        "Bill brings over 40 years of Major League Baseball leadership experience, including senior roles with the Angels, Dodgers, Mariners, and Reds. He helped shape player development and scouting strategy across the league and now consults for organizations such as Perfect Game, the Pioneer Baseball League, and MLB's Commissioner's Office.",
      fullBio: `Bill Bavasi retired in December 2020 after a 40-year career in Major League Baseball team operations. He now consults for various baseball organizations, including Perfect Game, the Pioneer Baseball League, and the MLB Commissioner's Office.

**Career Highlights:**
• 40+ years in Major League Baseball front offices
• San Diego Padres (1974–1977): Grounds Crew
• California Angels (1980–1999): Administrator, Farm Director, General Manager
• USA Olympic Baseball (2000): Co-General Manager (with Bob Watson)
• Inside Edge (2000–2001): Owner/Operator – independent scouting service
• Los Angeles Dodgers (2002–2003): Farm Director
• Seattle Mariners (2004–2008): EVP / General Manager
• Cincinnati Reds (2008–2014): SVP, Player Development, Scouting & International Ops
• MLB Commissioner's Office (2015–2020): Senior Director, Scouting & Game Development`,
      image: BillImage,
    },
    {
      id: "keith-jackson",
      name: "Keith Jackson",
      title: "Partner",
      shortBio:
        "Keith brings nearly 20 years of leadership in player development and youth baseball. As Executive Director of Action Baseball Club, he's guided countless players to reach their goals on and off the field, earning a reputation for mentorship, integrity, and community impact.",
      fullBio: `Keith Jackson has been a leader in amateur baseball development since founding Action Baseball Club in 2006. A lifelong student of the game, Keith played throughout high school and into college before an injury shifted his path from player to coach and organizer. His passion for the sport inspired the creation of Action, which has since become one of the most respected programs in the region.

Under Keith's leadership, Action Baseball Club has helped produce 63 MLB Draft Picks and 636 college baseball commitments. He takes the greatest pride in seeing players excel both on the diamond and in life — with many returning to coach within the program and pass their knowledge to the next generation.

Beyond baseball, Keith is known for the relationships he builds — staying in touch with many former players and even attending their weddings. His commitment to developing talent, character, and community continues to define his work with Baseball Alliance and beyond.`,
      image: KeithImage,
    },
  ];

  const teamLeadership: LeaderProfile[] = [
    {
      id: "eddie-cornblum",
      name: "Eddie Cornblum",
      title: "Field Coordinator",
      shortBio:
        "Eddie brings more than 25 years of coaching experience and leadership across Central Texas high school baseball. A proven program builder and mentor, he has guided multiple championship teams and continues to shape the next generation of athletes through his work with Baseball Alliance.",
      fullBio: `Eddie Cornblum has spent over two decades building winning baseball programs and developing young athletes into exceptional players and leaders. Now serving as Field Coordinator for Baseball Alliance, Eddie brings the same energy, experience, and competitive spirit that have defined his coaching career.

A native of San Diego, Eddie played college baseball before transferring to the University of Mary Hardin-Baylor (UMHB) in Belton, where he starred as a catcher and outfielder from 1992 to 1994. His coaching journey began in 1999 as an assistant at Temple High School, where he spent four seasons before moving on to Belton High School. There, he rose from assistant to head coach, leading Belton to five District Championships, eight consecutive playoff appearances, and averaging over 22 wins per season.

In 2016, Eddie became Head Baseball Coach at Midway High School, continuing his tradition of excellence. Under his leadership, Midway secured the 2025 6A State Championship — marking the program's first state title since 2005 — and celebrated Eddie's milestone 400th career win.

Beyond school programs, Eddie has also made an impact statewide as Head Coach of Team Texas through the Texas High School Baseball Coaches Association (THSBCA), leading his squad to three consecutive Sun Belt Championships. He's served as a THSBCA Director, Regional Representative, and on the All-Star and FCA Bowl committees, helping elevate high school baseball across Texas.

Eddie's deep experience, community ties, and championship pedigree make him an invaluable part of the Baseball Alliance team.`,
      image: EddieCornblumImage,
    },
  ];

  const renderLeaderCard = (leader: LeaderProfile) => {
    const isExpanded = expandedBios[leader.id];
    const bioLines = leader.fullBio.split("\n");

    return (
      <div
        key={leader.id}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-blue-50/20 shadow-md hover:shadow-2xl border border-gray-200/60 transition-all duration-500"
      >
        {/* Animated gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-transparent to-red-500/0 group-hover:from-blue-600/5 group-hover:to-red-500/5 transition-all duration-700 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row gap-6 p-6">
          {/* Compact Photo */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-xl overflow-hidden shadow-lg border-2 border-white group-hover:scale-105 transition-transform duration-500">
              <img
                src={leader.image || "/placeholder-leader.jpg"}
                alt={leader.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect fill='%23163968' width='128' height='128'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'%3E" +
                    leader.name.split(" ")[0] +
                    "%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#163968] to-blue-500 rounded-full opacity-80" />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#163968]/60 uppercase tracking-widest">
                  {leader.title}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#163968]/20 to-transparent" />
              </div>
              <h3 className="text-2xl font-black text-[#163968] tracking-tight">
                {leader.name}
              </h3>
            </div>

            {/* Short Bio */}
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {leader.shortBio}
            </p>

            {/* Expandable Content */}
            {isExpanded && (
              <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                <div className="rounded-xl bg-gradient-to-br from-blue-50/40 to-transparent p-4 border border-blue-100/50 space-y-2.5">
                  {bioLines.map((line, idx) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return (
                        <p
                          key={idx}
                          className="font-bold text-[#163968] text-base mt-4 mb-2 flex items-center gap-2"
                        >
                          <span className="w-1 h-5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    }
                    if (line.trim().startsWith("•")) {
                      return (
                        <p
                          key={idx}
                          className="ml-4 flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="text-blue-500 text-lg leading-none mt-0.5">
                            •
                          </span>
                          <span>{line.replace("•", "").trim()}</span>
                        </p>
                      );
                    }
                    return line.trim() ? (
                      <p
                        key={idx}
                        className="text-sm text-gray-700 leading-relaxed"
                      >
                        {line}
                      </p>
                    ) : (
                      <div key={idx} className="h-1" />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Video Embed */}
            {leader.videoUrl && isExpanded && (
              <div className="mb-4">
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200">
                  <iframe
                    src={leader.videoUrl}
                    title={`${leader.name} Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Button */}
            <button
              onClick={() => toggleBio(leader.id)}
              className="group/btn mt-auto inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#163968] to-blue-600 hover:from-[#163968] hover:to-blue-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 self-start"
            >
              {isExpanded ? "Show Less" : "Read Full Bio"}
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        <header className="mb-20 mt-16 relative">
          <div className="absolute -top-8 -left-4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#163968]" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#163968]/70">
                About Baseball Alliance
              </span>
            </div>
            <h1 className="text-6xl sm:text-7xl font-black text-[#163968] tracking-tighter mb-6">
              LEADERSHIP
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl leading-relaxed font-light">
              Meet the visionaries guiding the Baseball Alliance into the
              future.
            </p>
            <div className="h-1.5 w-32 bg-gradient-to-r from-[#163968] via-blue-500 to-red-500 rounded-full mt-8 shadow-lg shadow-blue-500/30" />
          </div>
        </header>

        {/* Intro Paragraph */}
        <div className="mb-20 max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-white to-blue-50/50 p-8 shadow-lg shadow-black/5 border border-white/60">
            <p className="text-lg text-gray-700 leading-relaxed">
              The Baseball Alliance is led by a group of seasoned executives,
              coaches, and operators with decades of experience across
              professional and amateur baseball. Their shared mission is to
              strengthen the sport's foundation through player development,
              integrity, and innovation — connecting athletes, coaches, and
              communities nationwide.
            </p>
          </div>
        </div>

        {/* By the Numbers - Bento Grid Style */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-[#163968]">
              By the Numbers
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-[#163968]/20 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
                <div className="relative">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#163968] to-blue-600 mb-3">
                    {stat.highlight}
                  </div>
                  <div className="text-sm text-gray-600 leading-snug font-medium">
                    {stat.description}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#163968] to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
            <h2 className="text-4xl font-black text-[#163968]">Leadership</h2>
          </div>
          <div className="space-y-6">
            {leadership.map((leader) => renderLeaderCard(leader))}
          </div>
        </section>

        {/* Team Leadership & Operations Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
            <h2 className="text-4xl font-black text-[#163968]">
              Team Leadership & Operations
            </h2>
          </div>
          <div className="space-y-6">
            {teamLeadership.map((leader) => renderLeaderCard(leader))}
          </div>
        </section>

        {/* Gallery Section */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
            <h2 className="text-4xl font-black text-[#163968]">Gallery</h2>
          </div>

          {/* Video Gallery */}
          <div className="space-y-6">
            {videos.map((video, index) => (
              <div
                key={video.id}
                onClick={() => openVideoModal(video)}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50/30 to-white shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-transparent to-red-500/0 group-hover:from-blue-600/5 group-hover:to-red-500/5 transition-all duration-700 pointer-events-none" />

                <div className="relative p-6 md:flex md:items-center md:gap-6">
                  {/* Video Thumbnail */}
                  <div className="relative md:w-80 shrink-0 mb-4 md:mb-0">
                    <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-white/80 bg-gradient-to-br from-gray-900 to-gray-800 aspect-video">
                      {/* Video First Frame */}
                      <video
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                      >
                        <source
                          src={`${video.videoUrl}#t=2.5`}
                          type="video/mp4"
                        />
                        <source
                          src={`${video.videoUrl}#t=2.5`}
                          type="video/quicktime"
                        />
                      </video>
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <svg
                            className="w-8 h-8 text-[#163968] ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                      {/* Video duration badge */}
                      <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-white text-xs font-semibold">
                        <svg
                          className="w-3 h-3 inline mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                        Video
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {index === 0 && (
                        <>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#163968] to-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                            </svg>
                            Featured
                          </span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                        </>
                      )}
                      <span className="text-xs text-gray-500 font-medium">
                        {video.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-[#163968] tracking-tight mb-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {video.description}
                    </p>

                    {/* Action hint */}
                    <div className="flex items-center gap-2 text-[#163968] text-sm font-semibold group-hover:gap-3 transition-all">
                      <span>Click to watch</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Coming Soon Placeholder */}
            <div className="rounded-3xl bg-gradient-to-br from-white via-blue-50/20 to-white p-12 text-center shadow-lg shadow-black/5 border border-white/60 border-dashed relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,57,104,0.03),transparent_70%)]" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#163968]/10 to-blue-500/10 mb-4">
                  <svg
                    className="w-8 h-8 text-[#163968]/30"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 text-base font-medium">
                  More leadership moments, team events, and interviews coming
                  soon.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-16" />
      </section>

      {/* Video Modal */}
      {isVideoModalOpen && selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={closeVideoModal}
        >
          <div
            className="relative w-full max-w-6xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeVideoModal}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-110 group"
              aria-label="Close video"
            >
              <svg
                className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video Header */}
            <div className="mb-4 mt-12">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#163968] to-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  Video
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span className="text-xs text-white/80 font-medium">
                  {selectedVideo.category}
                </span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">
                {selectedVideo.title}
              </h3>
            </div>

            {/* Video Player */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
              <div className="aspect-video">
                <video
                  key={selectedVideo.id}
                  controls
                  autoPlay
                  className="w-full h-full"
                  preload="metadata"
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  <source src={selectedVideo.videoUrl} type="video/quicktime" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Video Description */}
            <div className="mt-4 text-center">
              <p className="text-sm text-white/70">
                Press ESC or click outside to close
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Leadership;
