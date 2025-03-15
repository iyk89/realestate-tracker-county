import React, { memo } from 'react';

const ZOOM_THRESHOLD = 11; // Only show detailed tooltips above this zoom level

const tooltipBaseStyle = {
  position: 'fixed',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  color: '#fff',
  padding: '16px',
  borderRadius: '8px',
  fontSize: '14px',
  pointerEvents: 'none',
  transform: 'translate(-50%, -100%)',
  zIndex: 1001,
  minWidth: '280px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(2px)'
};

const titleStyle = {
  fontSize: '20px',
  fontWeight: '500',
  marginBottom: '12px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  paddingBottom: '8px'
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '15px'
};

const labelStyle = {
  color: '#aaa'
};

const valueStyle = {
  color: '#fff',
  fontWeight: '500',
  marginLeft: '24px'
};

const Tooltip = memo(({ content, position, zoom }) => {
  if (!content || !position) return null;
  
  // Return simplified tooltip at lower zoom levels
  if (zoom < ZOOM_THRESHOLD) {
    const [title] = content.split('\n');
    return (
      <div style={{
        ...tooltipBaseStyle,
        left: `${position[0]}px`,
        top: `${position[1] - 40}px`,
        width: 'auto',
        padding: '8px 12px',
      }}>
        <div style={{ fontSize: '14px' }}>{title}</div>
      </div>
    );
  }

  const dynamicStyle = {
    ...tooltipBaseStyle,
    left: `${position[0]}px`,
    top: `${position[1] - 15}px`
  };

  // Split content into title and data lines
  const [title, ...dataLines] = content.split('\n').filter(line => line.trim());

  return (
    <div style={dynamicStyle}>
      <div style={titleStyle}>{title}</div>
      {dataLines.map((line, index) => {
        const [label, value] = line.split(': ').map(s => s.trim());
        if (!value) return null;
        return (
          <div key={index} style={rowStyle}>
            <span style={labelStyle}>{label}</span>
            <span style={valueStyle}>{value}</span>
          </div>
        );
      })}
    </div>
  );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip; 