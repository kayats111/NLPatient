import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function AddPatientData() {
  const [data, setData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      readExcel(file);
    }
  };

  // Handle file drag over
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Read Excel file and parse data
  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1,defval:"N/A" });

      // Handle null or undefined values and replace with 'N/A' or another placeholder
      const cleanedData = jsonData.map(row => row.map(cell => cell === null || cell === undefined ? 'N/A' : cell));
      setData(jsonData); // Store cleaned data
    };
    reader.readAsBinaryString(file);
  };

  return (
    
    <div style={styles.buttonContainer}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={styles.dropArea}
      >
        <h2>Add New Patient Data</h2>
        <p>Drag and drop an Excel file here</p>

        {data.length > 0 && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {data[0].slice(0, 5).map((header, index) => (
                    <th key={index} style={styles.headerCell}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1, 5).map((row, rowIndex) => ( // Show at most 4 rows
                  <tr key={rowIndex}>
                    {row.slice(0, 5).map((cell, cellIndex) => (
                      <td key={cellIndex} style={styles.cell}>
                        {cell ===undefined?"N/A":cell} {/* Display the cell value or placeholder */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <button style={styles.button}>Click Me</button>
    </div>
  );
}

const styles = {
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '200px',
  },
  dropArea: {
    width: '80%',
    margin: '50px auto',
    padding: '20px',
    border: '2px dashed #007BFF',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    color: '#333',
    cursor: 'pointer',
  },
  tableContainer: {
    marginTop: '20px',
    overflowX: 'auto', // Enable horizontal scrolling
    maxWidth: '100%',
    whiteSpace: 'nowrap', // Prevent wrapping of content
  },
  table: {
    width: '100%', // Ensure table is wide enough to scroll
    borderCollapse: 'collapse',
    margin: '0 auto',
  },
  headerCell: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '10px',
    border: '1px solid #ddd',
    whiteSpace: 'nowrap', // Prevent wrapping for column headers
  },
  cell: {
    padding: '8px',
    border: '1px solid #ddd',
    textAlign: 'center',
    whiteSpace: 'nowrap', // Prevent wrapping for cell content
  },
};

export default AddPatientData;
