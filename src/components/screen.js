import React, { Component } from 'react';

const screenStyle = width => ({
  width: width * 10 + 10 + 'px'
});

const Screen = ({ width, height, data = [] }) => {
  const table = data.map((value, index) => (
    <div
      key={index}
      style={{ backgroundColor: `rgb(${value},${value},${value})` }}
    />
  ));

  return (
    <div className="screenn" style={screenStyle(width)}>
      {table}
    </div>
  );
};

export default Screen;
