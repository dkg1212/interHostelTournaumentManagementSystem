/* eslint-disable no-unused-vars */
// src/pages/Results.js
import { useEffect, useState } from 'react';
import Topbar from '../components/Toopbar'; // Assuming Topbar is correct
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2, ShieldAlert, ListChecks, Users } from 'lucide-react'; // Icons

// Hardcoded token for temporary testing (NOT FOR PRODUCTION)
const TEMP_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Nywicm9sZSI6ImRzdyIsImlhdCI6MTc0NjcxNDU2OCwiZXhwIjoxNzQ3MzE5MzY4fQ.4W6URhVuriZX1Y6KGDRqTUiM7jOlgrily6A7qiNkxa0';

// Reusable Table Component
const ResultsTable = ({ title, scores, tableType, onMaximize, onMinimize, isMaximized }) => {
  const IconComponent = tableType === 'solo' ? ListChecks : Users;

  if (!isMaximized && (!scores || scores.length === 0)) {
    // Don't show "no results" for a category if it's not in maximized view yet,
    // and we are in the grid view - the parent will handle overall "no results".
    // However, if we want to show individual "no results for this category" in grid:
    // return (
    //   <div className="p-4 bg-white shadow-lg rounded-lg">
    //     <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
    //       <IconComponent size={24} className="mr-2 text-blue-500" /> {title}
    //     </h2>
    //     <p className="text-center text-gray-500 py-4">No results for this category.</p>
    //   </div>
    // );
    // For now, let the parent handle the empty state to avoid clutter if one list is empty.
    // If we want to show the card even if empty (but not in modal), then the above is an option.
  }


  return (
    <motion.div
      className={`bg-white shadow-xl rounded-lg ${isMaximized ? 'w-full h-full flex flex-col' : 'mb-10'}`}
      layout // Enable layout animations if its container resizes
    >
      <div
        className="flex justify-between items-center p-3 bg-gray-100 rounded-t-lg cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={isMaximized ? onMinimize : onMaximize}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
          <IconComponent size={24} className="mr-2 text-blue-600" />
          {title}
        </h2>
        <motion.div whileTap={{ scale: 0.9 }}>
          {isMaximized ? (
            <Minimize2 size={20} className="text-gray-600" />
          ) : (
            <Maximize2 size={20} className="text-gray-600" />
          )}
        </motion.div>
      </div>

      {/* Conditional rendering for "no results" only if maximized and empty, or always if not maximized */}
      {scores && scores.length === 0 ? (
         <div className={`p-4 text-center text-gray-500 ${isMaximized ? 'flex-grow flex items-center justify-center' : 'py-4'}`}>
            No approved results available for this category.
         </div>
      ) : (
        <div className={`overflow-x-auto ${isMaximized ? 'flex-grow' : ''}`}>
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-gray-200 text-gray-700 uppercase">
              <tr>
                <th className="p-3 border-b border-gray-300 text-left">Event</th>
                <th className="p-3 border-b border-gray-300 text-left">Hostel</th>
                <th className="p-3 border-b border-gray-300 text-left">Participant / Team</th>
                <th className="p-3 border-b border-gray-300 text-center">Score</th>
                <th className="p-3 border-b border-gray-300 text-left">Remarks</th>
                <th className="p-3 border-b border-gray-300 text-center">TUSC Approved</th>
                <th className="p-3 border-b border-gray-300 text-center">DSW Approved</th>
                <th className="p-3 border-b border-gray-300 text-center">Final Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y divide-gray-200">
              {scores.map((score) => (
                <tr key={score.participation_id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="p-3 whitespace-nowrap">{score.event_name}</td>
                  <td className="p-3 whitespace-nowrap">{score.hostel_name || 'N/A'}</td>
                  <td className="p-3 whitespace-nowrap">{score.participant_name || 'N/A'}</td>
                  <td className="p-3 text-center">{score.score}</td>
                  <td className="p-3 min-w-[150px]">{score.event_remarks || score.remarks || '-'}</td>
                  <td className="p-3 text-center">
                    {score.tusc_approved ? (
                      <span title="TUSC Approved" className="text-green-600">✅</span>
                    ) : (
                      <span title="TUSC Not Approved" className="text-red-600">❌</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {score.dsw_approved ? (
                      <span title="DSW Approved" className="text-green-600">✅</span>
                    ) : (
                      <span title="DSW Not Approved" className="text-red-600">❌</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {score.final_approved ? (
                      <span title="Final Approved" className="text-green-600 font-semibold">Approved</span>
                    ) : (
                      <span title="Not Final Approved" className="text-red-500">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};


const Results = () => {
  const [soloScores, setSoloScores] = useState([]);
  const [teamScores, setTeamScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maximizedTable, setMaximizedTable] = useState(null); // 'solo', 'team', or null

  useEffect(() => {
    const fetchPublicScores = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:5050/api/event-participations/public-final-results', {
          headers: { 'Authorization': `Bearer ${TEMP_AUTH_TOKEN}` }
        });
        if (response.data.success) {
          setSoloScores(response.data.data.solo_events || []);
          setTeamScores(response.data.data.team_events || []);
        } else {
          setError(response.data.message || 'Failed to fetch results.');
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        if (err.response && err.response.status === 401) {
          setError('Authorization failed. Token might be invalid/expired.');
        } else if (err.response) {
          setError(`Error: ${err.response.data.message || err.response.statusText}`);
        } else {
          setError('Network error or server is down.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPublicScores();
  }, []);

  const handleMaximize = (tableType) => setMaximizedTable(tableType);
  const handleMinimize = () => setMaximizedTable(null);

  // Animation variants for table cards
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.4, ease: "easeOut" },
    }),
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.15, ease: "easeIn" } },
  };
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar />
        <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar />
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <ShieldAlert size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-700">Failed to Load Results</h2>
            <p className="text-red-600 mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Try Again
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Topbar />
      <div className="flex-1 p-4 sm:p-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Event Results</h1>
        
        {(soloScores.length === 0 && teamScores.length === 0 && !maximizedTable) ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-700 text-lg py-10"
          >
            No approved results are available at the moment. Please check back later.
          </motion.p>
        ) : (
          <div className={`container mx-auto transition-opacity duration-300 ${maximizedTable ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {soloScores.length > 0 && (
                 <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
                  <ResultsTable
                    title="Solo Event Results"
                    scores={soloScores}
                    tableType="solo"
                    onMaximize={() => handleMaximize('solo')}
                    isMaximized={false}
                  />
                </motion.div>
              )}
               {/* Placeholder to balance grid if only team scores exist */}
              {soloScores.length === 0 && teamScores.length > 0 && <div className="hidden lg:block"></div>}


              {teamScores.length > 0 && (
                <motion.div custom={soloScores.length > 0 ? 1:0} variants={cardVariants} initial="hidden" animate="visible">
                  <ResultsTable
                    title="Team Event Results"
                    scores={teamScores}
                    tableType="team"
                    onMaximize={() => handleMaximize('team')}
                    isMaximized={false}
                  />
                </motion.div>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {maximizedTable && (
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
              onClick={handleMinimize} // Click backdrop to minimize
            >
              <motion.div
                key="modal-content"
                variants={modalVariants}
                className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
              >
                <ResultsTable
                  title={maximizedTable === 'solo' ? "Solo Event Results" : "Team Event Results"}
                  scores={maximizedTable === 'solo' ? soloScores : teamScores}
                  tableType={maximizedTable}
                  onMinimize={handleMinimize}
                  isMaximized={true}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Results;