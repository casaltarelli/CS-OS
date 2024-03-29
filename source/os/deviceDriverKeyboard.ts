/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            var ctrl = params[2];

            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted + " ctrl:" + ctrl);
            
            var chr = "";

            if (ctrl && keyCode == 67) {                                        // Ctrl-C
                chr = "ctrl-c";
                _KernelInputQueue.enqueue(chr);
            }

            // Check to see if we even want to deal with the key that was pressed.
            if ((keyCode >= 65) && (keyCode <= 90)) {                           // Letter
                this.krnKbdDispatchLetter(params);
                // TODO: Check for caps-lock and handle as shifted if so.

            } else if ((keyCode >= 48) && (keyCode <= 57)) {                    // Digits
                this.krnKbdDispatchDigits(params);
                
            } else if (keyCode >= 186) {
                this.krnKbdDispatchSpecial(params);

            } else if (keyCode == 38) {                                         // Up Arrow
                chr = "up_arrow"; // Manually Assign Value for Arrow Key
                _KernelInputQueue.enqueue(chr);

            }  else if (keyCode == 40) {                                        // Up Arrow
                chr = "down_arrow"; // Manually Assign Value for Arrow Key
                _KernelInputQueue.enqueue(chr);
                
            } else if ((keyCode == 32) || (keyCode == 13) || (keyCode == 8) || (keyCode == 9)) {  // Space + Enter + Backspace + Tab
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            } 
        }

        public krnKbdDispatchLetter(params) {
            var keyCode = params[0];
            var isShifted = params[1];
            
            var chr = "";

            // Check if Shifted
            if (isShifted === true) { 
                chr = String.fromCharCode(keyCode);                     // Uppercase A-Z
            } else {
                chr = String.fromCharCode(keyCode + 32);                // Lowercase a-z
            }

            // Process Chr in Queue
            _KernelInputQueue.enqueue(chr);
        }

        public krnKbdDispatchDigits(params) {
            var keyCode = params[0];
            var isShifted = params[1];
            
            var chr = "";

            // Check if Shifted for Special Characters
            if (isShifted === true) {                           
                if (keyCode == 48) {
                    chr = String.fromCharCode(keyCode - 7);            // Punctuation: [ ) ]  

                } else if ((keyCode == 49) || ((keyCode >= 51) && (keyCode <= 53))) {
                    chr = String.fromCharCode(keyCode - 16);           // Punctuation: [ ! # $ % ]

                } else if (keyCode == 50) {
                    chr = String.fromCharCode(keyCode + 14);           // Punctuation: [ @ ]

                } else if (keyCode == 54) {
                    chr = String.fromCharCode(keyCode + 40);           // Punctuaton: [ ^ ]

                } else if ((keyCode == 55) || (keyCode == 57)) {       // Punctuation: [ & ( ]
                    chr = String.fromCharCode(keyCode - 17);

                } else if (keyCode == 56) {                            // Punctuation: [ * ]
                    chr = String.fromCharCode(keyCode - 14);
 
                }
            } else {
                // Normal Digit is Pressed
                chr = String.fromCharCode(keyCode);
            }

            //Process Chr in Queue
            _KernelInputQueue.enqueue(chr);
        }

        public krnKbdDispatchSpecial(params) {
            var keyCode = params[0];
            var isShifted = params[1];
            
            var chr = "";

            // Check if Shifted for Special Characters
            if (isShifted) {
                if ((keyCode == 186) || (keyCode == 188) || (keyCode == 190) || (keyCode == 191)) { // Punctuation: [ : > _ +]
                    chr = String.fromCharCode(keyCode - 128);
                } else if (keyCode == 187) {                                    // Punctuation: [ = ]
                    chr = String.fromCharCode(keyCode - 144);               
                } else if (keyCode == 189) {                                    // Punctuation: [ ? ]
                    chr = String.fromCharCode(keyCode - 94);                
                } else if (keyCode == 192) {                                    // Punctuation: [ ~ ]
                    chr = String.fromCharCode(keyCode - 66);
                } else if ((keyCode >= 219) && (keyCode <= 221)) {              // Punctuation: [ { | } ]
                    chr = String.fromCharCode(keyCode - 96);
                } else if (keyCode == 222) {                                    // Punctuation: [ " ]
                    chr = String.fromCharCode(keyCode - 188);
                }

            } else {
                if (keyCode == 186) {                                           // Punctuation: [ ; ]
                    chr = String.fromCharCode(keyCode - 127);   
    
                } else if (keyCode == 187) {                                    // Punctuation: [ = ]
                    chr = String.fromCharCode(keyCode - 126);
                    
                } else if ((keyCode >= 188) && (keyCode <= 191)) {              // Punctuation: [ , - . / ]
                    chr = String.fromCharCode(keyCode - 144);
                    
                } else if (keyCode == 192) {                                    // Punctuation: [ ` ]
                    chr = String.fromCharCode(keyCode - 96); 
                     
                } else if ((keyCode == 219) || (keyCode == 221)) {              // Punctuation: [ [ , ] ]
                    chr = String.fromCharCode(keyCode - 128); 
                    
                } else if (keyCode == 220) {
                    chr = String.fromCharCode(keyCode - 173);                   // Punctuation: [ \ ]
                    
                } else if (keyCode == 222) {
                    chr = String.fromCharCode(keyCode - 183);                   // Punctuation: [ ' ]
                }
            }
            
            //Process Chr in Queue
            _KernelInputQueue.enqueue(chr);
        }
    }
}
