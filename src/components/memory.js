import React, { Component } from 'react';
import { NumericInput } from '@blueprintjs/core';

/*function padDigits(number, digits) {
  return (
    Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number
  );
}*/

const Memory = ({ data, onMemoryChange }) => {
  return (
    <div className="memory">
      {data.map((value, index) => {
        //const valueAsString = padDigits(value, 3);
        return (
          <div key={index}>
            <NumericInput
              value={value}
              buttonPosition="none"
              min="-255"
              max="255"
              onValueChange={value => onMemoryChange(index, value)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Memory;
