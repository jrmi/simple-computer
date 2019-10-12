import React, { Component } from 'react';

const screenStyle = width => ({
  width: width * 10 + 10 + 'px'
});

class Screen extends Component {
  render() {
    const table = this.props.data.map((value, index) => (
      <div
        key={index}
        style={{ backgroundColor: `rgb(${value},${value},${value})` }}
      />
    ));
    return (
      <div className="screenn" style={screenStyle(this.props.width)}>
        {table}
      </div>
    );
  }
}

export default Screen;
