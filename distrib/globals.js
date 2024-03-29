/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
var APP_NAME = "CSOS";
var APP_VERSION = "0.1";
var CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 1;
var FILE_SYSTEM_IRQ = 2;
var RUN_CURRENT_PROCESS_IRQ = 3;
var TERMINATE_PROCESS_IRQ = 4;
var PRINT_YREGISTER_IRQ = 5;
var PRINT_FROM_MEMORY_IRQ = 6;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
// Hardware (Host)
var _CPU; // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Memory;
var _MemoryAccessor;
var _Disk;
// Dispatcher is not hardware consider moving to OS?
var _Dispatcher;
// Software (OS) 
var _MemoryManager;
var _Schedular;
var _PIDCounter = 0;
//var _PCB : TSOS.processControlBlock;
var _ResidentList = []; // List of all PCBs resident within the system
var _ReadyQueue = []; // List of all PCBs ready within the system
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelInputQueue = null;
var _KernelBuffers = null;
// Standard input and output
var _StdIn = null;
var _StdOut = null;
// UI
var _Console;
var _OsShell;
// Single Step Functionality
var _Step = false;
var _NextStep = false;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;
var _krnDiskDriver = null;
var _hardwareClockID = null;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
    updateClock();
};
function updateClock() {
    // Date + HTML Element
    var dateElement = document.getElementById("dateText");
    var dateObject = new Date();
    // Format Date
    var day = dateObject.getDate();
    var month = dateObject.getMonth();
    var year = dateObject.getFullYear();
    var date = month + "-" + day + "-" + year;
    // Format Time
    var time = dateObject.getHours() + ':' + dateObject.getMinutes() + ':' + dateObject.getSeconds();
    // Update Element
    dateElement.innerHTML = [date, time].join(' / ');
    // Update Every 1000ms
    setTimeout(updateClock, 1000);
}
