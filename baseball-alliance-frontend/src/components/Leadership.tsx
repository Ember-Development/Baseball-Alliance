import React, { useState } from "react";

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

const Leadership: React.FC = () => {
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});

  const toggleBio = (id: string) => {
    setExpandedBios((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const stats: StatItem[] = [
    {
      highlight: "100+ Years",
      description: "Of Baseball Leadership across MLB, high school, and amateur levels",
    },
    {
      highlight: "40+ Years",
      description: "In MLB Front Offices including Angels, Mariners, Dodgers, Reds, and the MLB Commissioner's Office",
    },
    {
      highlight: "63 MLB Draft Picks",
      description: "Developed through Action Baseball Club",
    },
    {
      highlight: "636 College",
      description: "Baseball Commitments under Action Baseball leadership",
    },
    {
      highlight: "400+ Career",
      description: "Coaching Wins led by Eddie Cornblum, including the 2025 6A State Championship",
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
      image: "/leader-john-lindsley.jpg",
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
      image: "/leader-bill-bavasi.jpg",
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
      image: "/leader-keith-jackson.jpg",
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
      image: "/leader-eddie-cornblum.jpg",
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
                        <p key={idx} className="font-bold text-[#163968] text-base mt-4 mb-2 flex items-center gap-2">
                          <span className="w-1 h-5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
                          {line.replace(/\*\*/g, "")}
                        </p>
                      );
                    }
                    if (line.trim().startsWith("•")) {
                      return (
                        <p key={idx} className="ml-4 flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-blue-500 text-lg leading-none mt-0.5">•</span>
                          <span>{line.replace("•", "").trim()}</span>
                        </p>
                      );
                    }
                    return line.trim() ? (
                      <p key={idx} className="text-sm text-gray-700 leading-relaxed">{line}</p>
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
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
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
              Meet the visionaries guiding the Baseball Alliance into the future.
            </p>
            <div className="h-1.5 w-32 bg-gradient-to-r from-[#163968] via-blue-500 to-red-500 rounded-full mt-8 shadow-lg shadow-blue-500/30" />
          </div>
        </header>

        {/* Intro Paragraph */}
        <div className="mb-20 max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-white to-blue-50/50 p-8 shadow-lg shadow-black/5 border border-white/60">
            <p className="text-lg text-gray-700 leading-relaxed">
              The Baseball Alliance is led by a group of seasoned executives,
              coaches, and operators with decades of experience across professional
              and amateur baseball. Their shared mission is to strengthen the
              sport's foundation through player development, integrity, and innovation
              — connecting athletes, coaches, and communities nationwide.
            </p>
          </div>
        </div>

        {/* By the Numbers - Bento Grid Style */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black text-[#163968]">By the Numbers</h2>
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

        {/* Gallery Section - Modern Empty State */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
            <h2 className="text-4xl font-black text-[#163968]">Gallery</h2>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-white p-16 text-center shadow-lg shadow-black/5 border border-white/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(22,57,104,0.05),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#163968]/10 to-blue-500/10 mb-6">
                <svg className="w-10 h-10 text-[#163968]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                Leadership moments, team events, and interviews will be featured here.
              </p>
            </div>
          </div>
        </section>

        <div className="h-16" />
      </section>
    </main>
  );
};

export default Leadership;