var Interpreter = function (source, tape, pointer,
                            out, awaitInput, instruction) {
    /*
     * Brain Interpreter Class
     * @source: Brain script
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
    var tokens = "<>+-.,[]$#*/%{}?:;!";
    var jumps = [], action = 0;
    var iterations = [];
    var countLines = 1;
    var canCountLines = true;

    var error = function (message) {
        return {
            "name": "Error",
            "message": message
        };
    };

    this.currentLine = function() {
        return countLines;
    }

    this.next = function () {
        if (action >= source.length) {
            if (jumps.length === 0) throw {
                "name": "End",
                "message": "End of brain script."
            };
            else {
                throw error("Mismatched command.");
            }
        }
        // Skip non-code characters
        if (tokens.indexOf(source[action]) === -1) {
            if(source[action] === '\n' && canCountLines) {
                countLines++;
            }
            action++;
            return this.next();
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

        case "*":
            cell.mul(tape.cellAt(index-1));
            break;

        case "/":
            cell.div(tape.cellAt(index-1));
            break;

        case "%":
            cell.rem(tape.cellAt(index-1));
            break;

        case ",":
	          awaitInput(cell);
            break;

        case ".":
        case "$":
        case "#":
            out(cell, index, token);
            break;

        case "[":
        case "{":
        case "?":
        case "!":
            if (cell.value() != 0 
                && (token === "[" || token === "?")) {
                jumps.push(action);
            } else if (cell.value() > 0 && token === "{") {
                iterations.push(cell.value());
                jumps.push(action);
            } else {
                if (token === "!" && jumps.length === 0) {
                    throw error("There is no loop to jump off.");
                }

                var loops = 1;
                while (loops > 0) {
                    action++;
                    if (action >= source.length) {
                        throw error("Mismatched command.");
                    }

                    if (loops == 1 
                        && source[action] === ":"
                        && token === "?") {
                        loops--;
                        jumps.push(action);
                        continue;
                    }

                    // we gotta add the ternary if to be
                    // compliant with the C++ compiler.
                    if (source[action] === "]"
                        || source[action] === "}"
                        || source[action] === ";") {
                        loops--;
                        if(token === "!") {
                            var theJump = source[jumps[jumps.length - 1]];
                            if (theJump === "["){
                                jumps.pop();
                            } else if (theJump === "{") {
                                jumps.pop();
                                iterations.pop();
                            }
                        }
                    } else if (source[action] === "["
                               || source[action] === "{"
                               || source[action] === "?") {
                        loops++;
                    }
                }
            }
            break;

        case "]":
        case "}":
        case ":":
        case ";":
            if (jumps.length === 0) {
                throw error("Mismatched command.");
            }

            if (source[jumps[jumps.length - 1]] === "?") {
                if (token === ":") {
                    var loops = 1;
                    while (loops > 0) {
                        action++;
                        if (action >= source.length) {
                            throw error("Mismatched command.");
                        }
                        if (source[action] === "]"
                            || source[action] === "}"
                            || source[action] === ";") {
                            loops--;
                        } else if (source[action] === "["
                                   || source[action] === "{"
                                   || source[action] === "?") {
                            loops++;
                        }
                    }
                }

                jumps.pop();
            } else if (source[jumps[jumps.length - 1]] === "{") {
                iterations[iterations.length - 1]--;
                if (iterations[iterations.length - 1] > 0) {
                    action = jumps[jumps.length - 1];
                    canCountLines = false;
                } else {
                    iterations.pop();
                    jumps.pop();
                    canCountLines = true;
                }
            }
            else {
                if (source[jumps[jumps.length - 1]] === ":") {
                    jumps.pop();
                } else if (cell.value() != 0) {
                    action = jumps[jumps.length - 1];
                    canCountLines = false;
                } else {
                    jumps.pop();
                    canCountLines = true;
                }
            }
            break;
        }
        return action++;
    }
};
