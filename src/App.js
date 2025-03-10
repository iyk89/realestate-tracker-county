import React, { useState } from 'react';
import './App.css';
import USMap from './components/Map';
import Header from './components/Header';
import SidePanel from './components/SidePanel';

function App() {
  const [realEstateData, setRealEstateData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const handleFileUpload = (data) => {
    setRealEstateData(data);
    // Reset selected columns when new data is uploaded
    setSelectedColumns([]);
  };

  return (
    <div className="App">
      <Header onFileUpload={handleFileUpload} />
      <div className="controls">
        <div className="info-text">Displaying county-level data with 4-week duration</div>
      </div>
      <USMap 
        data={realEstateData} 
        selectedColumns={selectedColumns}
      />
      <SidePanel 
        data={realEstateData}
        selectedColumns={selectedColumns}
        onColumnSelect={setSelectedColumns}
      />
    </div>
  );
}

export default App; 