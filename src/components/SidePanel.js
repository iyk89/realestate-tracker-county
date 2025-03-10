import React, { useMemo } from 'react';
import './SidePanel.css';

const SidePanel = ({ data, selectedColumns, onColumnSelect }) => {
  // Filter data to only include counties and 4-week duration
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.filter(item => 
      item.region_type?.toLowerCase() === 'county' && 
      item.duration?.toLowerCase() === '4 weeks'
    );
  }, [data]);

  // Get all columns from the first row of filtered data or show empty state
  const columns = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

  // Filter out any internal or metadata columns
  const isDisplayableColumn = (column) => {
    const lowercaseCol = column.toLowerCase();
    // Skip internal fields or metadata
    return !lowercaseCol.includes('id') && 
           !lowercaseCol.includes('fips') &&
           !lowercaseCol.includes('timestamp') &&
           !lowercaseCol.includes('date') &&
           lowercaseCol !== 'region_type' &&
           lowercaseCol !== 'duration' &&
           lowercaseCol !== 'region_name';
  };

  const displayableColumns = columns.filter(isDisplayableColumn);

  // Select first 4 columns by default when data is first loaded
  React.useEffect(() => {
    if (filteredData.length > 0 && selectedColumns.length === 0) {
      const initialColumns = displayableColumns.slice(0, 4);
      if (initialColumns.length > 0) {
        onColumnSelect(initialColumns);
      }
    }
  }, [filteredData, selectedColumns.length, onColumnSelect, displayableColumns]);

  return (
    <div className="side-panel">
      <h3>Select Data to Display</h3>
      {filteredData.length > 0 ? (
        <>
          <div className="data-info">
            <p>Showing data for counties with 4-week duration</p>
            <p>Counties available: {filteredData.length}</p>
          </div>
          <div className="column-selectors">
            {displayableColumns.map((column) => (
              <label key={column} className="column-selector">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onColumnSelect([...selectedColumns, column]);
                    } else {
                      onColumnSelect(selectedColumns.filter(col => col !== column));
                    }
                  }}
                />
                <span className="column-name">{column.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>Upload a file with county-level data to see available data points</p>
          <p>Make sure your data includes 'region_type', 'region_name', and 'duration' fields</p>
        </div>
      )}
    </div>
  );
};

export default SidePanel; 