import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import HostelList from './components/HostelList';
import AddHostel from './components/AddHostel';

const App = () => {
  const [refresh, setRefresh] = useState(false);

  const refreshHostels = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="App bg-gray-100 min-h-screen">
      <Dashboard />

      <div className="p-4">
        <AddHostel onHostelAdded={refreshHostels} />
        <HostelList refresh={refresh} />
      </div>
    </div>
  );
};

export default App;
