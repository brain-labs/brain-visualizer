var Interpreter = function (source, tape, pointer,
    out, awaitInput, instruction) {
  /*
   * Brainfuck Interpreter Class
   * @source: Brainfuck script
   * @tape: Tape model
   * @pointer: Pointer model
   * @out: Output callback
   * @awaitInput: Input callback
   *
   * Usage:
   *
   *    var interpreter = new Interpreter(">", tape, pointer);
   *    interpreter.next()
   *    pointer.get("index") // 1
   *
   * */
  var tokens = "<>+-.,[]!";
  var jumps = [], action = 0;

  //for ! operator
  var inputBuffer = new function() {
    this.buffer = "";
    this.initialized = false;
    this.hasInput = function () {
      if (this.initialized == false) {
        this.init();
      }
      return (this.buffer.length > 0);
    };
    this.init = function() {
      for(var i = 0, pipe = false; i < source.length; i++) {
        if (pipe) {
          this.buffer += source[i];
        }

        if (source[i] == '!') {
          pipe = true;
        }	
      }
      this.initialized = true;      
    };
    this.getNext = function() {
      var c = this.buffer.charCodeAt(0);
      this.buffer = this.buffer.substring(1);
      return c;
    };
  }

  function getIbHasInput() {
    alert("yes!");
  }


  var error = function (message) {
    return {
      "name": "Error",
      "message": message
    };
  };

  this.next = function (optimize) {
    if (action >= source.length) {
      if (jumps.length === 0) throw {
        "name": "End",
        "message": "End of brainfuck script."
      };
      else {
        throw error("Mismatched parentheses.");
      }
    }

    // Skip non-code characters
    if (tokens.indexOf(source[action]) === -1) {   
      action++;
      return this.next(optimize);
    }

    var index = pointer.get("index");
    instruction(action);
    var token = source[action];
    var cell = tape.cellAt(index);
    switch (token) {
    case "<":
        pointer.left();
        break;

    case ">":
        pointer.right();
        break;

    case "-":
        cell.dec();
        break;

    case "+":
        cell.inc();
        break;

    case ",":
        awaitInput(cell);
        break;

    case ".":
        out(cell);
        break;

    case "[":
        if (cell.get("value") != 0) {
            jumps.push(action);
        } else {
            var loops = 1;
            while (loops > 0) {
                action++;
                if (action >= source.length) {
                    throw error("Mismatched parentheses.");
                }
                
                if (source[action] === "]") {
                    loops--;
                } else if (source[action] === "[") {
                    loops++;
                }
            }
        }
        break;

    case ".":
      out(cell);
      break;

    case "[":
      if(optimize&&source[action+1]==="-"&&source[action+2]==="]"){
        cell.set("value",0);
      }
      if (cell.get("value") != 0) {
        jumps.push(action);
      } else {
        var loops = 1;
        while (loops > 0) {
          action++;
          if (action >= source.length) {
            throw error("Mismatched parentheses.");
          }

          if (source[action] === "]") {
            loops--;
          } else if (source[action] === "[") {
            loops++;
          }
        }
      }
      break;

    case "]":
      if (jumps.length === 0) {
        throw error("Mismatched parentheses.");
      }

      if (cell.get("value") != 0) {
        action = jumps[jumps.length - 1];
      } else {
        jumps.pop();
      }
      break; 
    case "!":
      tokens = "";
      break;
    }
    
    return action++;
  }
};
