import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Body from '../components/body';
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
    <div className="font-sans">
      <Header />
      <Body />
      <Footer />
    </div>
  );
}

export default HomePage;
