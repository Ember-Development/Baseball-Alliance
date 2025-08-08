// src/components/EventSection.tsx
import React from 'react'
import { useCountdown } from '../hooks/useCountdown'
import ticketBg from '../assets/baseballldirt.jpg'   // ← your image file

const EventSection: React.FC = () => {
  const { days, hours, minutes, seconds } = useCountdown(
    new Date('2025-01-21T00:00:00')
  )

  return (
    <section className="mt-16 space-y-6">
      <h2 className="text-2xl font-semibold uppercase">Upcoming Event</h2>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* countdown */}
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold">
            {String(days).padStart(2,'0')} : {String(hours).padStart(2,'0')} : {String(minutes).padStart(2,'0')} : {String(seconds).padStart(2,'0')}
          </div>
          <div className="text-xs uppercase tracking-widest text-gray-300 mt-1">
            Days Hours Minutes Seconds
          </div>
        </div>

        {/* ticket card with background image */}
        <div className="flex-1 max-w-xl">
          <div
            className="rounded-xl overflow-hidden flex flex-col md:flex-row bg-cover bg-center"
            style={{ backgroundImage: `url(${ticketBg})` }}
          >
            {/* optionally dim overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-none" />

            {/* left */}
            <div className="relative flex-1 p-6 text-white bg-black opacity-50 m-4 rounded-2xl">
              <h3 className="text-xl font-semibold mb-2">
                Texas Lonestar Showcase
              </h3>
              <p className="text-sm mb-1">
                <span className="font-semibold">When</span> | January 21st–23rd, 2025, Houston, TX
              </p>
              <p className="text-sm">
                <span className="font-semibold">Where</span> | The Diamonds at Daily Park
              </p>
            </div>

            {/* divider */}
            <div
              className="hidden md:block self-stretch border-l-1 border-dashed border-black mx-4"
            />
            {/* right */}
            <div className="relative p-6 flex flex-col items-center justify-center space-y-4">
              <a
                href="/register"
                className="uppercase text-blue-200 text-sm tracking-wide hover:underline"
              >
                Register Here
              </a>
              {/* simple barcode placeholder */}
              <div className="w-20 h-12 bg-white/50" />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-700" />
    </section>
  )
}

export default EventSection
