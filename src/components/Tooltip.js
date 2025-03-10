import React from 'react';

const Tooltip = ({ content, position }) => {
  if (!content || !position) return null;

  const style = {
    position: 'absolute',
    left: position[0] + 'px',
    top: position[1] + 'px',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    pointerEvents: 'none',
    transform: 'translate(-50%, -120%)',
    zIndex: 1000,
    maxWidth: '350px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(2px)'
  };

  // Split content into title and data
  const [title, ...dataLines] = content.split('\n\n');

  return (
    <div style={style}>
      <div style={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '8px',
        paddingBottom: '8px',
        fontWeight: 'bold',
        fontSize: '16px'
      }}>
        {title}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '8px 16px',
        alignItems: 'baseline'
      }}>
        {dataLines.join('').split('\n').map((line, index) => {
          const [label, value] = line.split(': ');
          if (!value) return null;
          return (
            <React.Fragment key={index}>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{label}:</div>
              <div style={{ fontWeight: '500' }}>{value}</div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Tooltip; 