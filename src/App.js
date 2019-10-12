import React, { Component } from 'react';
import './App.css';

import { Button, Card, H5 } from '@blueprintjs/core';

import Memory from './components/memory';
import Screen from './components/screen';
import KeyBoard from './components/keyboard';
import Editor from './components/editor';
import Stack from './components/stack';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

class App extends Component {
  constructor(props) {
    super(props);

    // This Binding
    this.onKeyClick = this.onKeyClick.bind(this);
    this.readKey = this.readKey.bind(this);
    this.setScreenValue = this.setScreenValue.bind(this);
    this.setMemoryValue = this.setMemoryValue.bind(this);
    this.execute = this.execute.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onInstruction = this.onInstruction.bind(this);
    this.pushStack = this.pushStack.bind(this);
    this.popStack = this.popStack.bind(this);

    this.screenHeight = 10;
    this.screenWidth = 50;
    this.memorySize = 20;

    this.state = {
      buffer: [],
      screen: [],
      memory: [],
      stack: [],
      code:
        'copy 1, mem[2]\nstart:\ncopy 200,*screen[2]\ninc mem[2]\ncopy mem[2], mem[3]\n' +
        'sub 10,mem[3]\npush mem[2]\npop mem[4]\ngo start ifpositive mem[3]\n'
    };
  }

  componentDidMount() {
    this.onReset();
  }

  async onKeyClick(value) {
    if (this.state.buffer.length < 3) {
      const buffer = this.state.buffer.slice();
      buffer.unshift(value);
      await this.setState({ buffer: buffer });
    }
    console.log(this.state.buffer);
  }

  async readKey() {
    if (this.state.buffer.length > 0) {
      const buffer = this.state.buffer.slice();
      const value = buffer.pop();
      await this.setState({ buffer: buffer });
      console.log(this.state.buffer);
      return value;
    } else {
      return 0;
    }
  }

  setScreenValue(index, value) {
    const screen = this.state.screen.slice();
    screen[index] = value;
    this.setState({ screen: screen });
  }

  async setMemoryValue(index, value) {
    const memory = this.state.memory.slice();
    memory[index] = value;
    await this.setState({ memory: memory });
  }

  async pushStack(value) {
    const stack = this.state.stack.slice();
    stack.push(value);
    await this.setState({ stack: stack });
  }

  async popStack() {
    const stack = this.state.stack.slice();
    const result = await stack.pop();
    console.log(result);
    await this.setState({ stack: stack });
    return result;
  }

  execute() {
    console.log('execute');
  }

  read(src) {
    switch (src.type) {
      case 'memory':
        return this.state.memory[src.index];
      case 'reference':
        return this.state.memory[this.state.memory[src.index]];
      case 'keyboard':
        return this.readKey();
      case 'value':
        return src.value;
      default:
        return null;
    }
  }

  write(dst, value) {
    switch (dst.type) {
      case 'memory':
        this.setMemoryValue(dst.index, value);
        break;
      case 'reference':
        this.setMemoryValue(this.state.memory[dst.index], value);
        break;
      case 'screen':
        this.setScreenValue(dst.index, value);
        break;
      case 'screenreference':
        this.setScreenValue(this.state.memory[dst.index], value);
        break;
      default:
        break;
    }
  }

  onInstruction(instruction, currentInstruction, targets) {
    console.log(instruction);
    let result;
    let nextInstruction = currentInstruction + 1;

    switch (instruction.action) {
      case 'copy':
        console.log('copy');
        this.write(instruction.dst, this.read(instruction.src));
        break;
      case 'add':
        console.log('add');
        result = this.read(instruction.src) + this.read(instruction.dst);
        this.write(instruction.dst, result);
        break;
      case 'sub':
        console.log('sub');
        result = this.read(instruction.src) - this.read(instruction.dst);
        this.write(instruction.dst, result);
        break;
      case 'inc':
        console.log('inc');
        result = this.read(instruction.dst) + 1;
        this.write(instruction.dst, result);
        break;
      case 'dec':
        console.log('dec');
        result = this.read(instruction.dst) - 1;
        this.write(instruction.dst, result);
        break;
      case 'go':
        console.log('go', instruction);
        if (!instruction.hasOwnProperty('condition')) {
          nextInstruction = targets[instruction.target];
        } else {
          const test = this.read(instruction.src);
          console.log(test);
          switch (instruction.condition) {
            case 'ifzero':
              if (test === 0) {
                nextInstruction = targets[instruction.target];
              }
              break;
            case 'ifpositive':
              if (test > 0) {
                nextInstruction = targets[instruction.target];
              }
              break;

            case 'ifnegative':
              if (test < 0) {
                nextInstruction = targets[instruction.target];
              }
              break;
            default:
              break;
          }
        }
        break;
      case 'call':
        this.callStack.push(nextInstruction);
        nextInstruction = targets[instruction.target];
        break;
      case 'return':
        nextInstruction = this.callStack.pop();
        break;
      case 'push':
        result = this.read(instruction.src);
        this.pushStack(result);
        break;
      case 'pop':
        this.popStack().then(result => {
          console.log('mii', result);
          this.write(instruction.dst, result);
        });
        break;
      default:
        console.log(
          `Error while executing unknown action ${instruction.action}`
        );
    }

    return { nextInstruction };
  }

  onReset() {
    const screen = Array.apply(
      null,
      new Array(this.screenHeight * this.screenWidth)
    ).map(Number.prototype.valueOf, 0);

    const memory = Array.apply(null, new Array(this.memorySize)).map(
      Number.prototype.valueOf,
      0
    );

    this.setState({
      buffer: [],
      stack: [],
      screen: screen,
      memory: memory
    });

    this.callStack = [];
  }

  render() {
    const numbers = [
      { key: '1', value: 35 },
      { key: '2', value: 36 },
      { key: '3', value: 37 },
      { key: '4', value: 38 },
      { key: '5', value: 39 },
      { key: '6', value: 40 },
      { key: '7', value: 41 },
      { key: '8', value: 42 },
      { key: '9', value: 43 },
      { key: 'Enter', value: 55 },
      { key: 'up', value: 60 },
      { key: 'down', value: 61 },
      { key: 'left', value: 62 },
      { key: 'right', value: 63 }
    ];
    return (
      <div className="App">
        <div className="leftSide">
          <Card>
            <H5>Code</H5>
            <Editor
              value={this.state.code}
              onChange={value => this.setState({ code: value })}
              onExecute={this.execute}
              onInstruction={this.onInstruction}
              onReset={this.onReset}
            />
          </Card>
        </div>
        <div className="rightSide">
          <Card>
            <H5>Keyboard</H5>
            <KeyBoard numbers={numbers} onKeyClick={this.onKeyClick} />
          </Card>
          <Card>
            <H5>Memory</H5>
            <Memory
              data={this.state.memory}
              onMemoryChange={this.setMemoryValue}
            />
          </Card>
          <Card>
            <H5>stack</H5>
            <Stack data={this.state.stack} />
          </Card>
          <Card>
            <H5>Screen</H5>
            <Screen
              width={this.screenWidth}
              height={this.screenHeight}
              data={this.state.screen}
            />
            <Button onClick={this.execute}>Execute</Button>
          </Card>
        </div>
      </div>
    );
  }
}

export default App;
