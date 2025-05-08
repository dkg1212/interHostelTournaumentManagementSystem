import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightCircle } from 'lucide-react';

function Body() {
  const navigate = useNavigate();

  const handleDashboardClick = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      navigate('/dashboard');
    } else {
      alert('Please login to view the dashboard.');
      navigate('/login');
    }
  };

  return (
    <div className="relative min-h-screen w-full h-[85vh] overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute w-full h-full object-cover z-0 brightness-75"
      >
        <source src="/videos/tournament.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-4">
        <h2 className="text-5xl font-extrabold mb-4 drop-shadow-xl">Welcome to Tournament Manager</h2>
        <p className="text-lg mb-6 max-w-2xl drop-shadow-md">
          Organize and track tournaments in real-time. Stylish. Fast. Reliable.
        </p>
        <button
          onClick={handleDashboardClick}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white rounded-full text-lg flex items-center gap-2 shadow-lg transition duration-300"
        >
          Go to Dashboard <ArrowRightCircle />
        </button>
      </div>
    </div>
  );
}

export default Body;
