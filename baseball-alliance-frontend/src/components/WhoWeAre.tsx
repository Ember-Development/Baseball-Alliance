import React from 'react'
import ImageCard from './ImageCard'

const cards = [
  {
    title: 'Invite-Only Alliance Top Select Teams',
    imageUrl: '/cards/teams.jpg',
  },
  {
    title: 'Elite Tournaments, Live Streams & Stats',
    imageUrl: '/cards/tournaments.jpg',
  },
  {
    title: 'Athlete Education Workshops & Guides',
    imageUrl: '/cards/education.jpg',
  },
  {
    title: 'Signed Merch & NIL Opportunities',
    imageUrl: '/cards/merch.jpg',
  },
]

const WhoWeAre: React.FC = () => (
  <section className="mt-20">
    <div className="md:flex md:space-x-12">
      {/* text */}
      <div className="md:w-1/3">
        <h2 className="text-2xl font-semibold uppercase mb-4">Who We Are</h2>
        <p className="text-gray-300">
          Baseball Alliance exists to unite the best youth baseball teams,
          providing member organizations with the tools, exposure, and support
          to take their athletes to the next level—college or professional.
        </p>
      </div>

      {/* cards */}
      <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 md:mt-0">
        {cards.map(c => (
          <ImageCard key={c.title} title={c.title} imageUrl={c.imageUrl} />
        ))}
      </div>
    </div>
  </section>
)

export default WhoWeAre
