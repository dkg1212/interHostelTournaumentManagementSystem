import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Body from '../components/body';
import Footer from '../components/Footer';

function HomePage() {
  const navigate = useNavigate();

  const handleNavigation = () => {
    const user = localStorage.getItem('user'); // Check if user exists in localStorage

    if (user) {
      // User exists, navigate to login page
      navigate('/login');
    } else {
      // User doesn't exist, navigate to signup page
      navigate('/signup');
    }
  };

  return (
    <div className="font-sans">
      <Header />
      <Body />
      <Footer />
      <section className="bg-blue-900 text-white h-screen flex items-center justify-center text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-semibold mb-4">The Best Esports Tournament Platform</h1>
          <p className="text-xl mb-8">Manage your tournaments with ease, track stats, and engage with your community like never before.</p>
          <p
            onClick={handleNavigation}
            className="text-lg font-semibold cursor-pointer underline hover:text-yellow-600"
          >
            {localStorage.getItem('user') ? 'Login' : 'Signup'}
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
