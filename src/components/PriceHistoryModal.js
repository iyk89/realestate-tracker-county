import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1002,
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  width: '90%',
  maxWidth: '800px',
  maxHeight: '90vh',
  overflow: 'auto',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#666',
};

const PriceHistoryModal = ({ isOpen, onClose, countyName, historyData }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      year: 'numeric'
    });
  };

  const chartData = {
    labels: historyData.map(d => formatDate(d.period_begin)),
    datasets: [
      {
        label: 'Monthly Median Sale Price',
        data: historyData.map(d => d.median_sale_price),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${countyName} Monthly Home Values`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            let formattedValue;
            if (value >= 1000000) {
              formattedValue = '$' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              formattedValue = '$' + (value / 1000).toFixed(0) + 'K';
            } else {
              formattedValue = '$' + value;
            }
            return `Median Price: ${formattedValue}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return '$' + (value / 1000).toFixed(0) + 'K';
            }
            return '$' + value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        <div style={{ height: '60vh', padding: '20px 0' }}>
          <Line data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal; 