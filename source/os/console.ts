/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "",
                    public tabList = [],
                    public tabIndex = 0,
                    public tabRegex = null,
                    public commandHistory = [],
                    public commandIndex = 0) {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
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
                    

                } else if (chr === String.fromCharCode(8)) { // Backspace key
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

                } else if (chr == String.fromCharCode(9) && this.buffer) { // Tab Key
                    if (this.tabList.length == 0) {
                        // Create RegEx to Test Against
                        this.tabRegex = new RegExp(`^${this.buffer}`);

                        // Push current Buffer to TabList
                        this.tabList.push(this.buffer);
                        

                        // Search Commands for Match 
                        for (let cmd of _OsShell.commandList) {
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

                        } else {
                            this.clearLine();
                            
                            // Increment TabIndex + Update Canvas 
                            this.tabIndex++;
                            this.putText(this.tabList[this.tabIndex]);
                            this.buffer = this.tabList[this.tabIndex];
                        }
                    }
                } else if (chr == "up_arrow") {
                    // Check if Command History has Next
                    if (this.commandIndex < this.commandHistory.length) {
                        this.clearLine();

                        // Go to Next Command
                        this.commandIndex++;

                        // Update Canvas + Buffer
                        this.putText(this.commandHistory[this.commandIndex]);
                        this.buffer = this.commandHistory[this.commandIndex];
                    } else {
                        // Exit Command History + Clear Line
                        this.commandIndex = this.commandHistory.length;
                        this.clearLine();
                    }

                } else if (chr == "down_arrow") {
                    // Check if Command History is Empty
                    if (this.commandHistory.length != 0) {
                        this.clearLine();

                        // Go to Previous Command
                        this.commandIndex--;

                        // Update Canvas + Buffer
                        this.putText(this.commandHistory[this.commandIndex]);
                        this.buffer = this.commandHistory[this.commandIndex];
                    }

                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }

                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */

            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;

                // Check XPosition is not at End of Canvas
                if (this.currentXPosition >= (_Canvas.width - _DefaultFontSize)) {
                    this.advanceLine();
                }
            }
        }

        public removeText(text, bufferLength) {
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

        }

        public clearLine() {
            // Reset Buffer + Update Canvas
            for (let i = this.buffer.length - 1; i > -1; i--) {
                this.removeText(this.buffer.charAt(i), this.buffer.length);
            }

            this.buffer = "";
        }

        public advanceLine(): void {
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
                let consoleData = _DrawingContext.getImageData(0, 0, _Canvas.width, this.currentYPosition + _FontHeightMargin);
                this.clearScreen();

                // Calculate Change to YPosition
                let differenceYPosition = this.currentYPosition - _Canvas.height + _FontHeightMargin;

                // Display Image Data at updated YPosition
                _DrawingContext.putImageData(consoleData, 0, -(differenceYPosition));

                // Reset XPosition + Update YPosition
                this.currentXPosition = 0;
                this.currentYPosition -= differenceYPosition;
            }
        }

        public getWrap() {
            // Calculate New X + Y for Line Wrap
            // X Position
            this.currentXPosition = _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer);
            this.currentXPosition += _DrawingContext.measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr + _OsShell.nameStr);
            
            // Y Position
            let differenceYPosition = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;
            this.currentYPosition -= differenceYPosition;
        }
    }
 }
