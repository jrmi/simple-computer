import React, { Component } from "react";
import CodeMirror from "react-codemirror";

import { Button, ButtonGroup, Callout } from "@blueprintjs/core";

import parser from "../utils/parser.js";

import CM from "codemirror";
import "codemirror/addon/mode/simple";
import "codemirror/addon/selection/active-line";
import "codemirror/lib/codemirror.css";

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this,
      args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

let simpleMode = {
  // The start state contains the rules that are intially used
  start: [
    // The regex matches the token, the token property contains the type
    //{regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
    // You can match multiple tokens at once. Note that the captured
    // groups must span the whole string in this case
    //{regex: /(function)(\s+)([a-z$][\w$]*)/, token: ["keyword", null, "variable-2"]},
    // Rules are matched in the order in which they appear, so there is
    // no ambiguity between this one and the one above
    //{regex: /(?:function|var|return|if|for|while|else|do|this)\b/, token: "keyword"},

    { regex: /(?:memory|mem|keyboard|stack|input|output)\b/, token: "keyword" },

    //{regex: /true|false|null|undefined/, token: "atom"},
    {
      regex: /copy|compare|goifzero|goifnzero|push|pop|call|return/,
      token: "atom"
    },

    {
      regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
      token: "number"
    },
    { regex: /\/\/.*/, token: "comment" },
    //{regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
    // A next property will cause the mode to move to a different state
    { regex: /\/\*/, token: "comment", next: "comment" },
    { regex: /[-+/*=<>!]+/, token: "operator" }
    // indent and dedent properties guide autoindentation
    //{regex: /[\{\[\(]/, indent: true},
    //{regex: /[\}\]\)]/, dedent: true},
    //{regex: /[a-z$][\w$]*/, token: "variable"},
    // You can embed other modes with the mode property. This rule
    // causes all code between << and >> to be highlighted with the XML
    // mode.
    //{regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}
  ],
  // The multi-line comment state.
  comment: [
    { regex: /.*?\*\//, token: "comment", next: "start" },
    { regex: /.*/, token: "comment" }
  ],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//"
  }
};

class Editor extends Component {
  constructor(props) {
    super(props);
    this.error = "";
    this.codemirror = React.createRef();
    CM.defineSimpleMode("simplemode", simpleMode);
    this.currentLine = 0;
    this.parsedCode = [];
    this.errors = [];

    this.state = {
      running: false
    };

    this.onChange = debounce(this.onChange.bind(this), 1000);
    this.onStep = this.onStep.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onToggleExecute = this.onToggleExecute.bind(this);
    this.execute = this.execute.bind(this);
  }

  componentDidMount() {
    this.onChange(this.props.value);
  }

  onChange(value) {
    this.errors = [];
    try {
      this.parsedCode = parser.parse(value);
      console.log(this.parsedCode);
      const { targets, errors } = this.semanticAnalysis(this.parsedCode);
      this.targets = targets;
      this.errors = errors;
      console.log(this.targets, this.errors);
    } catch (error) {
      console.log(error);
      this.errors.push(
        `${error.name}: Line ${error.location.start.line} - ${error.message}`
      );
    }

    this.props.onChange(value);
  }

  semanticAnalysis(instructions) {
    const targets = {};
    const errors = [];
    instructions.forEach(function(instruction, index) {
      console.log(instruction);
      if (instruction.label) {
        if (targets.hasOwnProperty(instruction.label)) {
          errors.push(
            `Line ${instruction.instruction.line}: symbol '${
              instruction.label
            }' already defined.`
          );
        } else {
          targets[instruction.label] = index;
        }
      }
    });
    return { targets, errors };
  }

  onStep() {
    if (this.currentLine < this.parsedCode.length) {
      const instruction = this.parsedCode[this.currentLine];
      const { nextInstruction } = this.props.onInstruction(
        instruction.instruction,
        this.currentLine,
        this.targets
      );
      this.currentLine = nextInstruction;
    } else {
      console.log("Execution finished !");
    }
  }

  async onToggleExecute() {
    await this.setState({ running: !this.state.running });
    //this.running = !this.running;
    this.execute();
  }

  execute() {
    if (this.state.running) {
      this.onStep();
      setTimeout(this.execute, 10);
    }
  }

  async onReset() {
    await this.setState({ running: false });
    this.currentLine = 0;
    this.props.onReset();
  }

  render() {
    let options = {
      lineNumbers: true,
      mode: "simplemode",
      styleActiveLine: true
    };

    const errors = this.errors.map((value, index) => {
      return (
        <Callout key="index" intent="danger">
          {value}
        </Callout>
      );
    });

    const canExecute = this.errors.length ? true : false;

    const execute = (() => {
      if (this.state.running) {
        return (
          <Button
            intent="warning"
            icon="pause"
            onClick={this.onToggleExecute}
            disabled={canExecute}
          >
            Stop
          </Button>
        );
      } else {
        return (
          <Button
            intent="success"
            icon="play"
            onClick={this.onToggleExecute}
            disabled={canExecute}
          >
            Execute
          </Button>
        );
      }
    })();

    return (
      <div className="editor">
        <CodeMirror
          className="code"
          value={this.props.value}
          onChange={this.onChange}
          options={options}
          ref={this.codemirror}
        />
        {errors}
        <ButtonGroup>
          <Button
            icon="refresh"
            intent="danger"
            onClick={this.onReset}
            disabled={canExecute}
          >
            Reset
          </Button>
          <Button
            icon="step-forward"
            onClick={this.onStep}
            disabled={canExecute}
          >
            Step
          </Button>
          {execute}
        </ButtonGroup>
      </div>
    );
  }
}

export default Editor;
