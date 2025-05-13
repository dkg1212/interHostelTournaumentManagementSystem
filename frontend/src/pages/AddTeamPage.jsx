/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { FiPlus, FiEdit3, FiUserPlus, FiEye, FiEyeOff, FiTrash2, FiXCircle } from 'react-icons/fi'; // Added FiTrash2, FiXCircle

// --- AddMemberModal Component (from previous suggestion - remains the same) ---
const AddMemberModal = ({ isOpen, onClose, team, students, onAddMember, loading }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  useEffect(() => {
    if (isOpen) setSelectedStudentId('');
  }, [isOpen]);

  if (!isOpen || !team) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Please select a student.');
      return;
    }
    onAddMember(team.id, selectedStudentId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Add Member to "{team.name}"</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="studentSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Student:
            </label>
            <select
              id="studentSelect"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select a Student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} (ID: {student.id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main AddTeamPage Component ---
const AddTeamPage = () => {
  const [teamName, setTeamName] = useState('');
  const [eventType, setEventType] = useState('sports');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [addingMember, setAddingMember] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [teamMembers, setTeamMembers] = useState({});
  const [loadingMembers, setLoadingMembers] = useState(null);
  const [viewingTeamMembers, setViewingTeamMembers] = useState(null);
  const navigate = useNavigate();

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [currentTeamForAddingMember, setCurrentTeamForAddingMember] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState({ type: '', text: '' });
  
  // New state for tracking member removal
  const [removingMemberState, setRemovingMemberState] = useState({ teamId: null, studentId: null, loading: false });


  const showFeedback = (text, type = 'error', duration = 4000) => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage({ text: '', type: '' }), duration);
  };

  useEffect(() => {
    const fetchData = async () => {
      // ... (fetchData logic remains the same)
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      setLoadingTeams(true);
      setLoadingStudents(true);
      try {
        const [teamResponse, studentResponse] = await Promise.all([
          axios.get('/api/teams', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTeams(teamResponse.data.teams || []);
        setStudents(studentResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showFeedback('Failed to fetch initial data.');
      } finally {
        setLoadingTeams(false);
        setLoadingStudents(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleCreateTeam = async (e) => {
    // ... (handleCreateTeam logic remains the same)
    e.preventDefault();
    if (!teamName.trim()) return showFeedback('Team name is required');

    const token = localStorage.getItem('token');
    setCreatingTeam(true);
    showFeedback('', ''); 

    try {
      const response = await axios.post(
        '/api/teams',
        { name: teamName, event_type: eventType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newTeam = response.data.team || { id: response.data.teamId, name: teamName, event_type: eventType };
      if (!newTeam.id) throw new Error('Team ID not returned');

      setTeams(prev => [newTeam, ...prev]); 
      showFeedback('Team created successfully!', 'success');
      setTeamName('');
    } catch (error) {
      console.error('Error creating team:', error);
      showFeedback(error.response?.data?.message || 'Failed to create team.');
    } finally {
      setCreatingTeam(false);
    }
  };

  const openAddMemberModal = (team) => {
    // ... (openAddMemberModal logic remains the same)
    setCurrentTeamForAddingMember(team);
    setIsAddMemberModalOpen(true);
    showFeedback('', '');
  };

  const handleAddMemberSubmit = async (targetTeamId, studentId) => {
    // ... (handleAddMemberSubmit logic remains the same, ensure event_type is handled as per your logic)
    const token = localStorage.getItem('token');
    setAddingMember(true);
    showFeedback('', '');

    try {
      const response = await axios.post(
        '/api/teams/add-member',
        {
          team_id: targetTeamId,
          student_id: studentId,
          event_type: currentTeamForAddingMember.event_type || eventType, 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showFeedback(response.data.message || 'Member added successfully!', 'success');
      setIsAddMemberModalOpen(false);
      if (viewingTeamMembers === targetTeamId) {
        fetchTeamMembers(targetTeamId, true); 
      }
    } catch (error) {
      console.error('Error adding member:', error);
      showFeedback(error.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const fetchTeamMembers = async (teamId, forceRefresh = false) => {
    // ... (fetchTeamMembers logic remains the same)
    if (viewingTeamMembers === teamId && !forceRefresh) {
      setViewingTeamMembers(null);
      return;
    }
    setViewingTeamMembers(teamId);
    setLoadingMembers(teamId); 
    showFeedback('', '');

    if (teamMembers[teamId] && !forceRefresh) {
      setLoadingMembers(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/teams/${teamId}/member`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeamMembers(prev => ({ ...prev, [teamId]: response.data.members || [] }));
    } catch (error) {
      console.error('Error fetching team members:', error);
      showFeedback('Failed to fetch team members.');
      setTeamMembers(prev => ({ ...prev, [teamId]: [] })); 
    } finally {
      setLoadingMembers(null);
    }
  };

  // --- New Handler for Removing a Team Member ---
const handleRemoveMember = async (teamId, studentIdToRemove, memberName) => {
  if (!window.confirm(`Are you sure you want to remove ${memberName || 'this member'} from the team?`)) {
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return;
  }

  setRemovingMemberState({ teamId, studentId: studentIdToRemove, loading: true });
  showFeedback('', '');

  try {
    // Construct the URL with actual values
    const url = `/api/teams/remove-member/${teamId}/${studentIdToRemove}`; // <-- CRITICAL CHANGE
    console.log("Requesting DELETE to URL:", url); // For debugging

    await axios.delete(
      url, // Use the constructed URL
      { // This is the config object
        headers: { Authorization: `Bearer ${token}` }
        // NO data field here if backend uses URL params and not req.body for these IDs
      }
    );

    setTeamMembers(prev => ({
      ...prev,
      [teamId]: prev[teamId]?.filter(member => (member.student_id || member.id) !== studentIdToRemove) || []
    }));
    showFeedback('Member removed successfully!', 'success');

  } catch (error) {
    console.error('Error removing member:', error);
    if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        showFeedback(error.response.data.message || `Failed to remove member. Status: ${error.response.status}`);
    } else if (error.request) {
        console.error('Error request:', error.request);
        showFeedback('Failed to remove member. No response received from server.');
    } else {
        console.error('Error message:', error.message);
        showFeedback(`Failed to remove member: ${error.message}`);
    }
  } finally {
    setRemovingMemberState({ teamId: null, studentId: null, loading: false });
  }
};


  const handleEditTeam = (teamId) => {
    navigate(`/edit-team/${teamId}`);
  };


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-sky-100 py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {feedbackMessage.text && (
          <div className={`p-4 mb-6 rounded-md text-sm ${
            feedbackMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`} role="alert">
            {feedbackMessage.text}
          </div>
        )}

        <section className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-10 sm:mb-12">
          {/* ... (Create Team Form - remains the same) ... */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center sm:text-left">
            Create New Team
          </h2>
          <form onSubmit={handleCreateTeam} className="space-y-5">
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                placeholder="e.g., The Champions"
              />
            </div>
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                id="eventType"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white"
              >
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creatingTeam}
              className="w-full sm:w-auto px-6 py-3 font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {creatingTeam ? 'Creating...' : 'Create Team'}
            </button>
          </form>
        </section>

        <section>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
            Existing Teams
          </h3>
          {loadingTeams ? (
            <div className="text-center py-10"><p className="text-gray-500 text-lg">Loading teams...</p></div>
          ) : teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  <h4 className="text-xl font-semibold text-gray-800 mb-1">{team.name}</h4>
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">
                    Event: {team.event_type || 'N/A'}
                  </p>

                  <div className="mt-auto pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => openAddMemberModal(team)}
                      className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                       {/* <FiUserPlus className="mr-2" /> */} Add Member
                    </button>
                    <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditTeam(team.id)}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        >
                           {/* <FiEdit3 className="mr-1.5" /> */} Edit
                        </button>
                        <button
                          onClick={() => fetchTeamMembers(team.id)}
                          className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                           {/* {viewingTeamMembers === team.id ? <FiEyeOff className="mr-1.5" /> : <FiEye className="mr-1.5" />} */}
                           {viewingTeamMembers === team.id ? 'Hide' : 'View'} Members
                        </button>
                    </div>
                  </div>

                  {viewingTeamMembers === team.id && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md max-h-60 overflow-y-auto"> {/* Increased max-h */}
                      {loadingMembers === team.id ? (
                        <p className="text-sm text-gray-500">Loading members...</p>
                      ) : (
                        (teamMembers[team.id] && teamMembers[team.id].length > 0) ? (
                          <ul className="space-y-2">
                            {teamMembers[team.id].map((member) => {
                              const memberIdentifier = member.student_id || member.id; // Ensure you have a unique ID for the member
                              const isCurrentlyRemoving = removingMemberState.loading &&
                                                        removingMemberState.teamId === team.id &&
                                                        removingMemberState.studentId === memberIdentifier;
                              return (
                                <li key={memberIdentifier} className="text-sm text-gray-700 bg-white p-2.5 rounded shadow-sm flex justify-between items-center">
                                  <span>
                                    {member.user_name || member.name}
                                    {member.hostel_name && ` (${member.hostel_name})`}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveMember(team.id, memberIdentifier, member.user_name || member.name)}
                                    disabled={isCurrentlyRemoving}
                                    className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                    title="Remove member"
                                  >
                                    {isCurrentlyRemoving ? (
                                        <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                      "✕" // Or use an icon: <FiXCircle size={16} />
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No members in this team yet.</p>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl shadow-md">
              <p className="text-gray-500 text-lg">No teams have been created yet.</p>
            </div>
          )}
        </section>
      </div>

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        team={currentTeamForAddingMember}
        students={students}
        onAddMember={handleAddMemberSubmit}
        loading={addingMember}
      />
    </div>
  );
};

export default AddTeamPage;