ProgramEx
  = _ instructions:(LabeledInstruction _)*
  { return instructions.map(function(e) { return e[0]; }); }

LabeledInstruction
  = label:Label _ ":" _ instruction:InstructionWithLine
  { return { 'label': label, 'instruction': instruction }; }
  / instruction:InstructionWithLine
  { return { 'label': null, 'instruction': instruction }; }
 
InstructionWithLine
  = instruction:Instruction
  { instruction.line = location().start.line - 1; return instruction }
  
Instruction
  = "push" _ src:MemoryLocation
  { return { 'action': 'push', 'src': src }; }
  / "pop" _ dest:MemoryLocation
  { return { 'action': 'pop', 'dst': dest }; }
  / "compare" _ src:MemoryLocation _ "," _ dst:MemoryLocation
  { return { 'action': 'compare', 'src': src, 'dst': dst }; }
  / "cmp" _ src:MemoryLocation _ "," _ dst:MemoryLocation
  { return { 'action': 'compare', 'src': src, 'dst': dst }; }
  / "go" _ label:Label _ cond:Condition _ src:MemoryLocation
  { return { 'action': 'go', 'target': label, 'condition': cond, 'src': src }; }
  / "go" _ label:Label
  { return { 'action': 'go', 'target': label }; }
  / "call" _ label:Label
  { return { 'action': 'call', 'target': label }; }
  / "return"
  { return { 'action': 'return' }; }
  / "copy" _ src:ValueOrMemoryLocation _ "," _ dst:MemoryLocation
  { return { 'action': 'copy', 'src': src, 'dst': dst }; }
  / "inc" _ dst:MemoryLocation
  { return { 'action': 'inc', 'dst': dst }; }
  / "dec" _ dst:MemoryLocation
  { return { 'action': 'dec', 'dst': dst }; }
  / "add" _ src:ValueOrMemoryLocation _ "," _ dst:MemoryLocation
  { return { 'action': 'add', 'src': src, 'dst': dst }; }
  / "sub" _ src:ValueOrMemoryLocation _ "," _ dst:MemoryLocation
  { return { 'action': 'sub', 'src': src, 'dst': dst }; }


Label
  = char0:[a-zA-Z_] chars:[a-zA-Z0-9_]*
  { return (char0 + chars.join("")); }

Condition
  = "ifzero" /  "ifpositive" / "ifnegative"
      
    
ValueOrMemoryLocation
  = val:Integer 
  { return {'type': 'value', 'value': val }; }
  / memloc:MemoryLocation 
  { return memloc; }

MemoryLocation
  = type:LocationType _ "[" _ index:Integer _ "]"
  { return { 'type': type, 'index': index, }; }
  / 'keyboard'
  { return { 'type': 'keyboard', 'index': 0, }; }

LocationType
  = "memory" { return 'memory'; }
  / "mem" { return 'memory'; }
  / "*memory" { return 'reference'; }
  / "*mem" { return 'reference'; }
  / "screen" { return 'screen'; }
  / "*screen" { return 'screenreference'; }

Integer "integer"
  = '-'?[0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = ( whiteSpace / lineTerminator / enclosedComment / lineComment )*
     { return []; }

whiteSpace 
  = [\t\v\f \u00A0\uFEFF] 

lineTerminator 
  = [\n\r] 

enclosedComment 
  = "/*" (!"*/" anyCharacter)* "*/" 

lineComment 
  = "//" (!lineTerminator anyCharacter)* 

anyCharacter 
  = . 
