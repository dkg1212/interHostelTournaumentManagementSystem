import React from 'react';
import Header from '../components/Header';

function About() {
  return (
    <><Header /><div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-center p-8">



          <h1 className="text-4xl font-bold mb-4">About Tournament Manager</h1>
          <p className="max-w-xl text-lg text-gray-700">
              Tournament Manager is a web application that helps universities, colleges, and organizers manage tournaments with ease.
              Our goal is to simplify scheduling, tracking, and performance analysis for sports and cultural events.
          </p>
      </div></>
  );
}

export default About;
