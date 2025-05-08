import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Body from '../components/Body';
import Footer from '../components/Footer';

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="font-sans bg-gray-100 min-h-screen flex flex-col">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}

export default HomePage;
