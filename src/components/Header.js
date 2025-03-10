import React, { useState } from 'react';
import './Header.css';

const Header = ({ onFileUpload }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.tsv')) {
      setSelectedFile(file);
    } else {
      alert('Please select a TSV file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      const text = await selectedFile.text();
      const rows = text.split('\n').map(row => row.split('\t'));
      const headers = rows[0];
      const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = row[index]?.trim();
        });
        return obj;
      });

      onFileUpload(data);
      setSelectedFile(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file');
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>Real Estate Map</h1>
        <button className="upload-btn" onClick={() => setIsModalOpen(true)}>
          Upload Data
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Upload TSV File</h2>
            <p>Please select a TSV file containing real estate data</p>
            <input
              type="file"
              accept=".tsv"
              onChange={handleFileChange}
              className="file-input"
            />
            <div className="modal-buttons">
              <button 
                className="upload-btn"
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                Upload
              </button>
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 