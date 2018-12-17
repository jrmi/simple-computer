import React, { Component } from "react";
import { Button } from "@blueprintjs/core";

class KeyBoard extends Component {
  constructor(props) {
    super(props);
    this.buffer = [];
  }

  onKeyClick(value) {
    return () => {
      this.props.onKeyClick(value);
    };
  }

  render() {
    const keyItems = this.props.numbers.map(number => (
      <Button
        className={`key_${number.key}`}
        key={number.key}
        onClick={this.onKeyClick(number.value)}
      >
        {number.key}
      </Button>
    ));
    return <div>{keyItems}</div>;
  }
}

export default KeyBoard;
