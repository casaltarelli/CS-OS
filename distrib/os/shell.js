/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.nameStr = "User";
            this.statusStr = "";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc;
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date.");
            this.commandList[this.commandList.length] = sc;
            // whereAmI
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "- Displays your current location.");
            this.commandList[this.commandList.length] = sc;
            // setname <string>
            sc = new TSOS.ShellCommand(this.shellSetName, "setname", "- Sets username.");
            this.commandList[this.commandList.length] = sc;
            // name 
            sc = new TSOS.ShellCommand(this.shellName, "name", "- Displays username.");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- <string> Updates User Status.");
            this.commandList[this.commandList.length] = sc;
            // death
            sc = new TSOS.ShellCommand(this.shellDeath, "death", "- death Displays BSOD Message for OS errors.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- load validates user code and uploads to main memory.");
            this.commandList[this.commandList.length] = sc;
            // run <pid> 
            sc = new TSOS.ShellCommand(this.shellRun, "run", " - <pid> run executes a process by a specified pid.");
            this.commandList[this.commandList.length] = sc;
            // kill <pid> 
            sc = new TSOS.ShellCommand(this.shellKill, "kill", " - <pid> kill terminates a process in main memory.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // Display the initial  prompt.
            this.putName();
            this.putPrompt();
        };
        Shell.prototype.putName = function () {
            _StdOut.putText(this.nameStr);
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the name + prompt again.
            this.putName();
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                var found = false;
                // Look for Arg in Shell Command List
                for (var i in _OsShell.commandList) {
                    if (_OsShell.commandList[i].command == topic) {
                        found = true;
                        _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
                    }
                }
                // Output Undefined if not found
                if (!found) {
                    _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function (args) {
            // Declare Date Object + Output
            var d = new Date();
            _StdOut.putText("Today's Date: " + d);
        };
        Shell.prototype.shellWhereAmI = function (args) {
            // Display Users Location
            _StdOut.putText("5th & Chestnut");
        };
        Shell.prototype.shellSetName = function (args) {
            // Update Username
            if (args.length > 0) {
                _OsShell.nameStr = args[0];
            }
            else {
                _StdOut.putText("Usage: name <string>  Please give a name.");
            }
        };
        Shell.prototype.shellName = function (args) {
            // Display Users set username
            _StdOut.putText(_OsShell.nameStr);
        };
        Shell.prototype.shellStatus = function (args) {
            // Update User Status
            if (args.length > 0) {
                // Reset Status
                _OsShell.statusStr = "";
                // Iterate over Status Args
                var i = 0;
                while (args[i] != null) {
                    _OsShell.statusStr = _OsShell.statusStr + args[i] + " ";
                    i++;
                }
                // Format Status
                _OsShell.statusStr = "Status: " + _OsShell.statusStr;
                //Update Element
                var statusText = document.getElementById("statusMsg");
                statusText.innerHTML = _OsShell.statusStr;
            }
            else {
                _StdOut.putText("Usage: status <string> Please provide a status");
            }
        };
        Shell.prototype.shellDeath = function (args) {
            // Display BSOD
            var canvas = document.getElementById("display");
            canvas.style.backgroundColor = "blue";
            // Clear Canvas
            _StdOut.clearScreen();
            _StdOut.resetXY();
            _StdOut.putText("FATAL ERROR: Shutting down...");
            _Kernel.krnTrapError("Kernal death");
            _Kernel.krnShutdown();
        };
        Shell.prototype.shellLoad = function (args) {
            // Get Textarea Content
            var userInput = document.getElementById("taProgramInput").value;
            // Remove White Space
            userInput = userInput.replace(/\s/g, "");
            // Validate Input via RegEx + Output to Canvas
            var regex = /^[A-Fa-f0-9]+$/;
            if (regex.test(userInput)) {
                var input = userInput.match(/.{2}/g);
                var pcb = _MemoryManager.load(input);
                // Test Load Success
                if (pcb) {
                    _StdOut.putText("Program with PID " + pcb.pid + " loaded into memory segment" + pcb.segment + ".");
                }
                else {
                    _StdOut.putText("Memory is full. Please clear before loading new process.");
                }
            }
            else {
                _StdOut.putText("Hex Code could not be validated. Please try again.");
            }
        };
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0) {
                // Get Process PCB
                var pid = parseInt(args[0]);
                var pcb = void 0;
                // Find Process within ReadyQueue
                for (var _i = 0, _ResidentList_1 = _ResidentList; _i < _ResidentList_1.length; _i++) {
                    var process = _ResidentList_1[_i];
                    if (process.pid == pid) {
                        pcb = process;
                    }
                }
                // Update Console
                if (!pcb) {
                    _StdOut.putText("Process " + pid + " does not exist.");
                }
                else if (pcb.state === "running") {
                    _StdOut.putText("Process " + pid + " is already running.");
                }
                else if (pcb.state === "terminated") {
                    _StdOut.putText("Process " + pid + " had already ran and has been terminated.");
                }
                else if (_CPU.PCB && _CPU.isExecuting == true) {
                    _StdOut.putText("CPU is already running process " + _CPU.PCB.pid + ", process " + pid + " added to Ready Queue.");
                    // Update Ready Queue through Kernel
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, pcb));
                }
                else {
                    _StdOut.putText("Running process " + pid + ".");
                    // Update CPU State through Kernel
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(RUN_CURRENT_PROCESS_IRQ, pcb));
                }
            }
            else {
                _StdOut.putText("Usage: run <pid> Please provide a pid.");
            }
        };
        Shell.prototype.shellKill = function (args) {
            if (args.length > 0) {
                var pcb = void 0;
                // Validate pid in our Resident List
                out: for (var _i = 0, _ResidentList_2 = _ResidentList; _i < _ResidentList_2.length; _i++) {
                    var process = _ResidentList_2[_i];
                    if (process.pid == args[0]) {
                        pcb = process;
                        break out;
                    }
                }
                // Update Console
                if (pcb) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, pcb));
                    _StdOut.putText("Process " + pcb.pid + " has been killed.");
                }
                else {
                    _StdOut.putText("Process " + args[0] + " does not exist.");
                }
            }
            else {
                _StdOut.putText("Usage: kill <pid> Please provide a pid.");
            }
        };
        Shell.prototype.shellKillAll = function (args) {
            // Terminate all Proccesses Resident + Ready Queue
            for (var _i = 0, _ResidentList_3 = _ResidentList; _i < _ResidentList_3.length; _i++) {
                var process = _ResidentList_3[_i];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, process));
                _StdOut.putText("Process " + process.pid + " has been killed.");
                _StdOut.advanceLine();
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
