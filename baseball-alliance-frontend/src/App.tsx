import React from 'react'
import NavBar from './components/NavBar'
import Hero from './components/Hero'
import EventSection from './components/EventSection'
import WhoWeAre from './components/WhoWeAre'

function App() {
  return (
    <div className="font-sans text-white bg-gray-900">
      <NavBar />
      <Hero />
      <main className="px-4 md:px-16 lg:px-32">
        <EventSection />
        <WhoWeAre />
      </main>
    </div>
  )
}

export default App
