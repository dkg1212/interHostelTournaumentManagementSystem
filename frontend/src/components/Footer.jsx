import React from 'react';

function Footer() {
  return (
    <footer className="bg-black bg-opacity-80 text-white py-4 text-center">
      <p className="text-sm">
        © {new Date().getFullYear()} Tournament Manager. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
