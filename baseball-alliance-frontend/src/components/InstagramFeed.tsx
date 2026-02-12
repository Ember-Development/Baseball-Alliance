import React from "react";
import { FaInstagram } from "react-icons/fa";

const InstagramFeed: React.FC = () => {
  const instagramUsername = "baseball_alliance";
  const instagramUrl = `https://www.instagram.com/${instagramUsername}/`;

  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-0 mt-16 mb-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <FaInstagram className="text-3xl text-[#E4405F]" />
          <h2 className="text-3xl md:text-4xl font-bold text-[#163968]">
            Follow Us on Instagram
          </h2>
        </div>
        <p className="text-gray-600 mb-6">
          Stay connected with the latest updates, highlights, and behind-the-scenes content
        </p>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-[#E4405F] via-[#F56040] to-[#FCAF45] hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <FaInstagram size={20} />
          Follow @{instagramUsername}
        </a>
      </div>

      {/* Instagram Feed Widget */}
      <div className="mt-8">
        {/* Option 1: SnapWidget (Recommended - Free)
            Steps:
            1. Visit https://snapwidget.com/
            2. Create account and click "Create Widget"
            3. Enter username: baseball_alliance
            4. Customize and get embed code
            5. Replace the SRC below with your widget URL
        */}
        {/* <div className="rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200">
          <iframe
            src={`https://snapwidget.com/embed/code/${instagramUsername}`}
            className="w-full"
            allowTransparency
            frameBorder="0"
            scrolling="no"
            style={{
              border: "none",
              overflow: "hidden",
              width: "100%",
              minHeight: "600px",
            }}
            title="Instagram Feed"
          />
        </div> */}

        {/* Option 2: Elfsight (Alternative - Free)
            Visit: https://elfsight.com/instagram-feed-widget/
            Get embed code and replace the iframe above
        */}

        {/* Option 3: Instagram Basic Display API (Advanced)
            Requires Facebook Developer account and app setup
            See: https://developers.facebook.com/docs/instagram-basic-display-api
        */}
      </div>

      {/* Fallback: Direct link if widget doesn't load */}
      {/* <div className="mt-4 text-center">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-[#E4405F] transition-colors"
        >
          View on Instagram →
        </a>
      </div> */}
    </section>
  );
};

export default InstagramFeed;

