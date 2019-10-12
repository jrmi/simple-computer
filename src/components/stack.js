import React from 'react';

const Stack = ({ data }) => {
  return (
    <div className="stack">
      {data.map((value, index) => {
        return <div key={index}>{value}</div>;
      })}
    </div>
  );
};

export default Stack;
