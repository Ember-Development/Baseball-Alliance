import React, { useRef, useState } from "react";

const MEMBERSHIP_VIDEO_SRC =
  "https://firebasestorage.googleapis.com/v0/b/goatnet-4a76f.firebasestorage.app/o/Software%2FBaseballAllianceWesbiteVideo22526.mp4?alt=media&token=dac0dd7f-db9a-4bdf-ad49-dcc7067f9c51";

const Membership: React.FC = () => {
  const membershipLink = "https://events.baseballalliance.co/memberships";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const handlePlay = () => {
    setShowPlaceholder(false);
    videoRef.current?.play();
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
                Baseball Alliance
              </span>
            </div>
            <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#163968] via-blue-600 to-[#163968] tracking-tighter mb-6">
              MEMBERSHIP
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl leading-relaxed font-light mb-8">
              Your membership unlocks verified performance data, elevated visibility, and access to education, college-matching tools, and exclusive experiences.
            </p>
            <a
              href={membershipLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-[#163968] to-blue-600 hover:from-[#163968] hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Join Membership
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
            <div className="h-1.5 w-32 bg-gradient-to-r from-[#163968] via-blue-500 to-red-500 rounded-full mt-8 shadow-lg shadow-blue-500/30" />
          </div>
        </header>

        {/* Video Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
            <h2 className="text-4xl font-black text-[#163968]">Membership Overview</h2>
          </div>
          
          <div className="rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-white p-16 text-center shadow-lg shadow-black/5 border border-white/60 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(22,57,104,0.05),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
            
            <div className="relative">
              <h3 className="text-2xl font-bold text-[#163968] mb-4">
                Membership Information Video
              </h3>
              <div className="aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden border-2 border-gray-300 shadow-xl relative bg-gradient-to-br from-[#163968]/90 via-blue-700/80 to-[#163968]/90">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain absolute inset-0"
                  src={MEMBERSHIP_VIDEO_SRC}
                  controls
                  playsInline
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
                {showPlaceholder && (
                  <button
                    type="button"
                    onClick={handlePlay}
                    className="absolute inset-0 w-full h-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#163968] rounded-2xl"
                    aria-label="Play membership video"
                  >
                    <span className="flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/30 hover:scale-110 transition-all duration-200">
                      <svg
                        className="w-12 h-12 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    <span className="sr-only">Play video</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Membership Details */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-1.5 bg-gradient-to-b from-[#163968] to-blue-500 rounded-full" />
            <h2 className="text-4xl font-black text-[#163968]">What's Included</h2>
          </div>

          {/* Intro Card */}
          <div className="mb-8 rounded-3xl bg-gradient-to-br from-[#163968] via-blue-600 to-[#163968] p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative">
              <p className="text-xl sm:text-2xl text-white font-semibold leading-relaxed text-center max-w-4xl mx-auto">
                Baseball Alliance Membership is designed to give players meaningful exposure and long-term support.
              </p>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Verified Performance Data Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#163968] to-blue-600 mb-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#163968] mb-3">Verified Performance Data</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Members receive verified performance data that lives beyond events, helping elevate their profile through trusted metrics, leaderboards, and athlete features.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#163968] to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
            </div>

            {/* Ongoing Visibility Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#163968] to-blue-600 mb-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#163968] mb-3">Ongoing Visibility</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  This information is paired with ongoing visibility through content, interviews, and event coverage that helps players stay relevant and discoverable over time.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#163968] to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
            </div>

            {/* Educational Resources Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#163968] to-blue-600 mb-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#163968] mb-3">Educational Resources</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Membership unlocks access to exclusive interviews and insights from players, coaches, and industry voices.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#163968] to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
            </div>

            {/* College-Matching System Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#163968] to-blue-600 mb-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#163968] mb-3">College-Matching System</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  A college-matching system built to help athletes identify the right opportunities and pathways for their development.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#163968] to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
            </div>

            {/* Community & Network Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#163968] to-blue-600 mb-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#163968] mb-3">Community & Network</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Members gain access to livestreams, exclusive experiences, and a growing network focused on accountability, development, and opportunity.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#163968] to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
            </div>

            {/* Partners & Discounts Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-lg shadow-black/5 border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#163968] to-blue-600 mb-4 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#163968] mb-3">Partners & Discounts</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Athletes unlock access to best-in-class partners, discounts, and opportunities designed to support training, performance, and long-term growth.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#163968] to-blue-500 w-0 group-hover:w-full transition-all duration-500" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#163968] via-blue-600 to-[#163968] p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            <div className="relative">
              <h2 className="text-4xl font-black text-white mb-4">
                Ready to Elevate Your Game?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join Baseball Alliance Membership and unlock the tools, visibility, and community you need to reach the next level.
              </p>
              <a
                href={membershipLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-lg uppercase tracking-wider transition-all duration-300 bg-white text-[#163968] shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-105"
              >
                Get Started Today
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <div className="h-16" />
      </section>
    </main>
  );
};

export default Membership;

