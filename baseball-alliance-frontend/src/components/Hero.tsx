import React from 'react'
import heroBg from '../assets/baseballldirt.jpg' 

const Hero: React.FC = () => (
  <section
      className="relative h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg})` }}
  >
    {/* dark overlay */}
    <div className="absolute inset-0 bg-red opacity-60" />

    <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4">
      <p className="text-sm uppercase tracking-widest mb-4">
        An invite-only network for the nation’s top youth talent
      </p>
      <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
        Elevate Your Game<br/>With Baseball Alliance
      </h1>
      <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-red-500 rounded-full text-white uppercase tracking-wide hover:opacity-90 transition mb-10">
        Learn More
      </button>
      <div className="animate-bounce">
        <svg
          className="h-8 w-8 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </section>
)

export default Hero
