import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-black bg-opacity-70 text-white px-6 py-4 flex justify-between items-center shadow-lg fixed w-full z-20">
      <h1 className="text-2xl font-bold tracking-wide">🏆 Tournament Manager</h1>
      <nav className="space-x-6">
        <Link to="/" className="hover:text-blue-400 transition">Home</Link>
        <Link to="/about" className="hover:text-blue-400 transition">About</Link>
        <Link to="/contact" className="hover:text-blue-400 transition">Contact</Link>
        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white transition">Login</Link>
      </nav>
    </header>
  );
}

export default Header;
