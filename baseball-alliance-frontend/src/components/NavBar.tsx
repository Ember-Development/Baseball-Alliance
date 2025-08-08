import React from 'react'
import BA from '../assets/baseballheader.png';

const NavBar: React.FC = () => (
  <nav className="fixed w-full z-50 backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
      {/* logo */}
      <img src={BA} alt="Baseball Alliance" className="h-32 mt-12" />

      {/* links */}
      <ul className="hidden md:flex space-x-6 text-sm uppercase tracking-wide">
        {['Home','Members','Events','Resources','Alumni','About Us'].map(label => (
          <li key={label} className="hover:text-red-500 cursor-pointer">
            {label}
          </li>
        ))}
      </ul>

      {/* login */}
      <button className="px-4 py-2 border border-white rounded-full text-sm hover:bg-white hover:text-black transition">
        Login
      </button>
    </div>
  </nav>
)

export default NavBar
