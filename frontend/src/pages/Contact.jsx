import React from 'react';
import Header from '../components/Header';

function Contact() {
  return (
    <><Header /><div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-200 text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="max-w-xl text-lg text-gray-700 mb-4">
              Got questions or suggestions? Reach out to us at:
          </p>
          <p className="text-lg font-semibold text-gray-800">📧 contact@tournamentmanager.com</p>
      </div></>
  );
}

export default Contact;
