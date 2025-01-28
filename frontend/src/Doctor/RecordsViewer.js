import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from 'react-router-dom';

import "./RecordsViewer.css";
const server_url = "http://localhost:3000/api/data"
const RecordsViewer = () => {
  const navigate = useNavigate(); // Use the hook for navigation
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 8;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(server_url+"/read/records/all");
        if (!response.ok) {
          throw new Error(`Failed to fetch records: ${response.status}`);
        }
        const data = await response.json();
        setRecords(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRecords();
  }, []);

    // Simulate fetching data from the backend
  //   const mockFetchRecords = async () => {
  //     try {
  //       // Simulate a delay
  //       await new Promise((resolve) => setTimeout(resolve, 500));

  //       // Mock data: Generate thousands of records
  //       const mockData = Array.from({ length: 1000 }, (_, index) => ({
  //         id: index + 1,
  //         name: `Record ${index + 1}`,
  //         price: index * 100
  //       }));

  //       setRecords(mockData);
  //     } catch (err) {
  //       setError("Failed to fetch mock records.");
  //     }
  //   };

  //   mockFetchRecords();
  // }, []);

  // Calculate the current records to display
  const startIndex = currentPage * recordsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + recordsPerPage);

  const handlePrevious = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNext = () => {
    setCurrentPage((prevPage) =>
      prevPage < Math.ceil(records.length / recordsPerPage) - 1 ? prevPage + 1 : prevPage
    );
  };

  const handleUpdate = (record) => {
    navigate("/update-medical-records",{state:{record}})
  };

  const handleDelete = async (record) => {
    let id = record.id;
    try {
      const response = await fetch(server_url+`/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // console.log(response)
      // if (!response) {
      //   throw new Error(`Failed to delete record with ID ${id}: ${response.status}`);
      // }
  
      // const data = response;
      // console.log('Record deleted successfully:', id);
      alert(`Record ID: ${record.codingNum}, Deleted Successfully`)
      window.location.reload()
      // You can update the state here to reflect the deletion
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handlePredict = (id) => {
    navigate("/doctor-predict")
  };

  return (
    <div>
      <h1>Record Names</h1>
      {error ? (
        <p className="error-message">Error: {error}</p>
      ) : (
        <div>
          <ul id="records">
            {currentRecords.map((record) => (
              <li key={record.id} className="record">
                <span>Record ID: {record.codingNum}</span>
                <div className="record-buttons">
                  <button onClick={() => handleUpdate(record)}>View</button>
                  <button onClick={() => handleDelete(record)}>Delete</button>
                  <button onClick={() => handlePredict(record.id)}>Predict</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="pagination-buttons">
            <button onClick={handlePrevious} disabled={currentPage === 0}>
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={startIndex + recordsPerPage >= records.length}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsViewer;