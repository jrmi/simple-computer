import React from 'react';

const screenStyle = width => ({
  width: width * 10 + 10 + 'px'
});

const Screen = ({ width, height, data = [] }) => {
  return (
    <div className="screenn" style={screenStyle(width)}>
      {data.map((value, index) => (
        <div
          key={index}
          style={{ backgroundColor: `rgb(${value},${value},${value})` }}
        />
      ))}
    </div>
  );
};

export default Screen;
