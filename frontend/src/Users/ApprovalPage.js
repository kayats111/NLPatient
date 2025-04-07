import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ApprovalPage.css'; // Don't forget to import your CSS

function ApprovalPage() {
  const [approvals, setApprovals] = useState([]);
  const url = "http://localhost:3004";

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const response = await axios.get(`${url}/api/user/approvals`);
      if (!response.data.error) {
        setApprovals(response.data.value);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      await axios.post(`${url}/api/user/approve/${id}`, { decision });
      // Remove from list
      setApprovals(prev => prev.filter(app => app.id !== id));
    } catch (error) {
      console.error(`Failed to ${decision} user with id ${id}:`, error);
    }
  };

  return (
    <div className="approval-page-container">
      <h2 className="approval-page-title">Pending Approvals</h2>
      {approvals.length === 0 ? (
        <p className="approval-page-no-approvals">No approvals pending.</p>
      ) : (
        <table className="approval-page-table">
          <thead>
            <tr>
              <th className="approval-page-header">Username</th>
              <th className="approval-page-header">Email</th>
              <th className="approval-page-header">Role</th>
              <th className="approval-page-header">Timestamp</th>
              <th className="approval-page-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval) => (
              <tr key={approval.id} className="approval-page-row">
                <td className="approval-page-cell">{approval.username}</td>
                <td className="approval-page-cell">{approval.email}</td>
                <td className="approval-page-cell">{approval.role}</td>
                <td className="approval-page-cell">
                  {new Date(approval.timestamp).toLocaleString()}
                </td>
                <td className="approval-page-actions">
                  <button
                    className="approval-page-approve-btn"
                    onClick={() => handleDecision(approval.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="approval-page-deny-btn"
                    onClick={() => handleDecision(approval.id, 'deny')}
                  >
                    Deny
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ApprovalPage;
