/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, tabList, tabIndex, tabRegex, commandHistory, commandIndex) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            if (tabList === void 0) { tabList = []; }
            if (tabIndex === void 0) { tabIndex = 0; }
            if (tabRegex === void 0) { tabRegex = null; }
            if (commandHistory === void 0) { commandHistory = []; }
            if (commandIndex === void 0) { commandIndex = 0; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.tabList = tabList;
            this.tabIndex = tabIndex;
            this.tabRegex = tabRegex;
            this.commandHistory = commandHistory;
            this.commandIndex = commandIndex;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === "ctrl-c") {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TERMINATE_PROCESS_IRQ, _CPU.PCB));
                }
                else if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // Update Command History + Index
                    this.commandHistory.push(this.buffer);
                    this.commandIndex = this.commandHistory.length;
                    // Reset Tab List
                    this.tabList = [];
                    this.tabIndex = 0;
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) { // Backspace key
                    // Check Buffer for Chars
                    if (this.buffer) {
                        // Delete Char from Canvas
                        this.removeText(this.buffer.charAt(this.buffer.length - 1), this.buffer.length - 1);
                        // Update Buffer
                        this.buffer = this.buffer.slice(0, -1);
                    }
                    // Reset the tab index and list
                    this.tabIndex = 0;
                    this.tabList = [];
                }
                else if (chr == String.fromCharCode(9) && this.buffer) { // Tab Key
                    if (this.tabList.length == 0) {
                        // Create RegEx to Test Against
                        this.tabRegex = new RegExp("^" + this.buffer);
                        // Push current Buffer to TabList
                        this.tabList.push(this.buffer);
                        // Search Commands for Match 
                        for (var _i = 0, _a = _OsShell.commandList; _i < _a.length; _i++) {
                            var cmd = _a[_i];
                            if (this.tabRegex.test(cmd.command)) {
                                this.tabList.push(cmd.command);
                            }
                        }
                        // Check for Next Index 
                        if (this.tabList[this.tabIndex + 1] == undefined) {
                            this.clearLine();
                            // Reset TabList + Canvas
                            this.tabIndex = 0;
                            this.putText(this.tabList[this.tabIndex]);
                            this.buffer = this.tabList[this.tabIndex];
                            this.tabList = [];
                        }
                        else {
                            this.clearLine();
                            // Increment TabIndex + Update Canvas 
                            this.tabIndex++;
                            this.putText(this.tabList[this.tabIndex]);
                            this.buffer = this.tabList[this.tabIndex];
                        }
                    }
                }
                else if (chr == "up_arrow") {
                    // Check if Command History has Next
                    if (this.commandIndex < this.commandHistory.length) {
                        this.clearLine();
                        // Go to Next Command
                        this.commandIndex++;
                        // Update Canvas + Buffer
                        this.putText(this.commandHistory[this.commandIndex]);
                        this.buffer = this.commandHistory[this.commandIndex];
                    }
                    else {
                        // Exit Command History + Clear Line
                        this.commandIndex = this.commandHistory.length;
                        this.clearLine();
                    }
                }
                else if (chr == "down_arrow") {
                    // Check if Command History is Empty
                    if (this.commandHistory.length != 0) {
                        this.clearLine();
                        // Go to Previous Command
                        this.commandIndex--;
                        // Update Canvas + Buffer
                        this.putText(this.commandHistory[this.commandIndex]);
                        this.buffer = this.commandHistory[this.commandIndex];
                    }
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        };
        Console.prototype.putText = function (text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                for (var _i = 0, text_1 = text; _i < text_1.length; _i++) {
                    var ch = text_1[_i];
                    this.putChar(ch);
                }
            }
        };
        Console.prototype.putChar = function (ch) {
            // Draw the character at the current X and Y coordinates
            _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, ch);
            // Move the current X position.
            var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, ch);
            // Check Before Printing next line
            this.currentXPosition = this.currentXPosition + offset;
            // Check XPosition is at End of Canvas
            if (this.currentXPosition >= (_Canvas.width - _DefaultFontSize)) {
                this.advanceLine();
            }
        };
        Console.prototype.removeText = function (text, bufferLength) {
            // Check if text is wrapped - Update X & Y 
            if (bufferLength > 0 && this.currentXPosition <= 0) {
                this.getWrap();
            }
            // Calculate Rectangle Size
            var xOffset = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
            var yOffset = this.currentYPosition - _DefaultFontSize;
            // Erase Character 
            _DrawingContext.clearRect(xOffset, yOffset, this.currentXPosition, this.currentYPosition + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize));
            // Update Current XPosition
            this.currentXPosition = this.currentXPosition - _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
        };
        Console.prototype.clearLine = function () {
            // Reset Buffer + Update Canvas
            for (var i = this.buffer.length - 1; i > -1; i--) {
                this.removeText(this.buffer.charAt(i), this.buffer.length);
            }
            this.buffer = "";
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // Check if Canvas needs to be Scrolled
            if (this.currentYPosition > _Canvas.height) {
                // Get Image Data + Clear Current Console
                var consoleData = _DrawingContext.getImageData(0, 0, _Canvas.width, this.currentYPosition + _FontHeightMargin);
                this.clearScreen();
                // Calculate Change to YPosition
                var differenceYPosition = this.currentYPosition - _Canvas.height + _FontHeightMargin;
                // Display Image Data at updated YPosition
                _DrawingContext.putImageData(consoleData, 0, -(differenceYPosition));
                // Reset XPosition + Update YPosition
                this.currentXPosition = 0;
                this.currentYPosition -= differenceYPosition;
            }
        };
        Console.prototype.getWrap = function () {
            // Calculate New X + Y for Line Wrap
            // X Position
            this.currentXPosition = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            this.currentXPosition += _DrawingContext.measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr + _OsShell.nameStr);
            // Y Position
            var differenceYPosition = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
            this.currentYPosition -= differenceYPosition;
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
