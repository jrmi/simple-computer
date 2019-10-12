import React from 'react';
import { Button } from '@blueprintjs/core';

const KeyBoard = ({ numbers, onKeyClick }) => {
  return (
    <div>
      {numbers.map(number => (
        <Button
          className={`key_${number.key}`}
          key={number.key}
          onClick={onKeyClick(number.value)}
        >
          {number.key}
        </Button>
      ))}
    </div>
  );
};

export default KeyBoard;
