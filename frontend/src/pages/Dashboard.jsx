// src/pages/Dashboard.jsx
import React from 'react';
import '../index.css'; // Tailwind CSS import

function App() {
  return (
    <div className="font-sans ">
      {/* Navbar */}
      <header className="bg-gray-900 w-screen text-white">
        <div className="max-w-6xl mx-auto p-6 flex justify-between items-center">
          <div className="text-2xl font-bold">Tournament</div>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="#" className="hover:text-gray-400">Home</a></li>
              <li><a href="#features" className="hover:text-gray-400">Features</a></li>
              <li><a href="#about" className="hover:text-gray-400">About</a></li>
              <li><a href="#contact" className="hover:text-gray-400">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-900 text-white h-screen flex items-center justify-center text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-semibold mb-4">The Best Esports Tournament Platform</h1>
          <p className="text-xl mb-8">Manage your tournaments with ease, track stats, and engage with your community like never before.</p>
          <button className="bg-red-500 px-6 py-2 text-lg font-semibold rounded-lg shadow-lg hover:bg-yellow-600">
      Get Started
    </button>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Seamless Tournament Creation</h3>
              <p>Quickly create tournaments, set rules, and invite players. It's that easy!</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Live Brackets & Updates</h3>
              <p>Track your matches and tournament progress in real-time with live updates.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4">Advanced Stats & Analytics</h3>
              <p>Get detailed statistics and analytics for each player and match.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-12">Tournament Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-4xl font-bold mb-2">500+</h3>
              <p>Tournaments</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">100K+</h3>
              <p>Players</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">3000+</h3>
              <p>Matches</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">50+</h3>
              <p>Games Supported</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2025 Tournament Platform. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
