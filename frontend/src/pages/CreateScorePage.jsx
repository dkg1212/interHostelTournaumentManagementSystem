/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ParticipantsList = () => {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all participations when the component mounts
  useEffect(() => {
    const fetchParticipations = async () => {
      try {
        const response = await axios.get('http://localhost:5173/api/participations');
        setParticipations(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch participations');
        setLoading(false);
      }
    };

    fetchParticipations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>All Event Participations</h2>
      <table>
        <thead>
          <tr>
            <th>Event Name</th>
            <th>User Name</th>
            <th>Team Name</th>
            <th>Position</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {participations.length > 0 ? (
            participations.map((participation) => (
              <tr key={participation.id}>
                <td>{participation.event_name}</td>
                <td>{participation.user_name || 'N/A'}</td>
                <td>{participation.team_name || 'N/A'}</td>
                <td>{participation.position || 'N/A'}</td>
                <td>{participation.score || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No participations found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ParticipantsList;
