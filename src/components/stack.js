import React, { Component } from "react";

class Stack extends Component {
  render() {
    const table = this.props.data.map((value, index) => {
      return <div key={index}>{value}</div>;
    });
    return <div className="stack">{table}</div>;
  }
}

export default Stack;
