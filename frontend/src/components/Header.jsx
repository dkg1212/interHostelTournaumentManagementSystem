// src/components/Header.jsx
import React from 'react';

function Header() {
  return (
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
  );
}

export default Header;
