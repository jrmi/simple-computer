import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import CodeMirror from 'react-codemirror';

import { Button, ButtonGroup, Callout } from '@blueprintjs/core';

import parser from '../utils/parser.js';

import CM from 'codemirror';
import 'codemirror/addon/mode/simple';
import 'codemirror/addon/selection/active-line';
import 'codemirror/lib/codemirror.css';

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

    { regex: /(?:memory|mem|keyboard|stack|input|output)\b/, token: 'keyword' },

    //{regex: /true|false|null|undefined/, token: "atom"},
    {
      regex: /copy|compare|goifzero|goifnzero|push|pop|call|return/,
      token: 'atom'
    },

    {
      regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
      token: 'number'
    },
    { regex: /\/\/.*/, token: 'comment' },
    //{regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
    // A next property will cause the mode to move to a different state
    { regex: /\/\*/, token: 'comment', next: 'comment' },
    { regex: /[-+/*=<>!]+/, token: 'operator' }
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
    { regex: /.*?\*\//, token: 'comment', next: 'start' },
    { regex: /.*/, token: 'comment' }
  ],
  // The meta property contains global information about the mode. It
  // can contain properties like lineComment, which are supported by
  // all modes, and also directives like dontIndentStates, which are
  // specific to simple modes.
  meta: {
    dontIndentStates: ['comment'],
    lineComment: '//'
  }
};

CM.defineSimpleMode('simplemode', simpleMode);

const semanticAnalysis = instructions => {
  const targets = {};
  const errors = [];
  instructions.forEach((instruction, index) => {
    //console.log(instruction);
    if (instruction.label) {
      if (targets.hasOwnProperty(instruction.label)) {
        errors.push(
          `Line ${instruction.instruction.line}: symbol '${instruction.label}' already defined.`
        );
      } else {
        targets[instruction.label] = index;
      }
    }
  });
  return [targets, errors];
};

const handleStep = ({ onInstruction, parsedCode, currentLine, targets }) => {
  //console.log('Current line', currentLine);
  if (currentLine < parsedCode.length) {
    const instruction = parsedCode[currentLine];
    const { nextInstruction } = onInstruction(
      instruction.instruction,
      currentLine,
      targets
    );
    return nextInstruction;
  } else {
    return null;
  }
};

const Editor = ({ value, onChange, onExecute, onInstruction, onReset }) => {
  let isMounted = true;
  const [errors, setErrors] = useState([]);
  const [running, setRunning] = useState(false);
  const [codeState, setCodeState] = useState({
    parsedCode: [],
    running: false,
    targets: [],
    currentLine: 0
  });

  const codemirror = useRef();
  const runningRef = useRef(running);
  runningRef.current = running;
  const codeStateRef = useRef(codeState);
  codeStateRef.current = codeState;

  const codeMirrorOptions = {
    lineNumbers: true,
    mode: 'simplemode',
    styleActiveLine: true
  };

  if (codemirror.current) {
    codemirror.current.getCodeMirror().doc.setCursor(codeState.currentLine);
  }

  const handleChange = debounce(value => {
    try {
      const parsedCode = parser.parse(value);
      setCodeState(prev => {
        return { ...prev, parsedCode: parsedCode };
      });
    } catch (error) {
      console.log('error', error);
      setErrors([
        `${error.name}: Line ${error.location.start.line} - ${error.message}`
      ]);
      return;
    }
    onChange(value);
  }, 500);

  useEffect(() => {
    if (!isMounted) return;
    handleChange(value);
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const [newTargets, newErrors] = semanticAnalysis(codeState.parsedCode);
    setErrors(newErrors);
    setCodeState(prev => {
      return { ...prev, targets: newTargets };
    });
  }, [codeState.parsedCode]);

  useEffect(() => {
    const interval = setInterval(() => {
      execute();
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const execute = () => {
    onExecute();
    if (runningRef.current) {
      executeOne();
    }
  };

  const executeOne = () => {
    const nextInstruction = handleStep({
      onInstruction,
      ...codeStateRef.current
    });
    if (nextInstruction === null) {
      setRunning(false);
      console.log('Program terminated normally');
      return;
    }
    setCodeState(prev => {
      return { ...prev, currentLine: nextInstruction };
    });
  };

  const handleReset = () => {
    setRunning(false);
    setCodeState(prev => {
      return { ...prev, currentLine: 0 };
    });
    onReset();
  };

  const canExecute = errors.length ? true : false;

  return (
    <div className="editor">
      <CodeMirror
        className="code"
        value={value}
        onChange={handleChange}
        options={codeMirrorOptions}
        ref={codemirror}
      />
      {errors.map((value, index) => {
        return (
          <Callout key="index" intent="danger">
            {value}
          </Callout>
        );
      })}
      <ButtonGroup>
        <Button
          icon="refresh"
          intent="danger"
          onClick={handleReset}
          disabled={canExecute}
        >
          Reset
        </Button>
        <Button icon="step-forward" onClick={executeOne} disabled={canExecute}>
          Step
        </Button>
        <Button
          intent={running ? 'warning' : 'success'}
          icon={running ? 'pause' : 'play'}
          onClick={() => setRunning(!running)}
          disabled={canExecute}
        >
          {running ? 'Stop' : 'Execute'}
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default Editor;
