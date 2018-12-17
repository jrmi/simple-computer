import React, { Component } from "react";

class Screen extends Component {
  render() {
    const screenStyle = {
      width: this.props.width * 10 + 10 + "px"
    };
    const table = this.props.data.map((value, index) => (
      <div
        key={index}
        style={{ backgroundColor: `rgb(${value},${value},${value})` }}
      />
    ));
    return (
      <div className="screenn" style={screenStyle}>
        {table}
      </div>
    );
  }
}

export default Screen;
