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
const APP_NAME: string    = "CSOS";
const APP_VERSION: string = "0.1";

const CPU_CLOCK_INTERVAL: number = 100;   // This is in ms (milliseconds) so 1000 = 1 second.

const TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                              // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;
const FILE_SYSTEM_IRQ = 2;
const RUN_CURRENT_PROCESS_IRQ = 3;
const TERMINATE_PROCESS_IRQ = 4;
const PRINT_YREGISTER_IRQ: number = 5;
const PRINT_FROM_MEMORY_IRQ: number = 6;

//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
// Hardware (Host)
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _Memory: TSOS.Memory;
var _MemoryAccessor: TSOS.MemoryAccessor;
var _Disk: TSOS.Disk;

// Dispatcher is not hardware consider moving to OS?
var _Dispatcher: TSOS.Dispatcher;

// Software (OS) 
var _MemoryManager: TSOS.MemoryManager;
var _Schedular: TSOS.Scheduler;
var _PIDCounter = 0;

//var _PCB : TSOS.processControlBlock;
var _ResidentList = []; // List of all PCBs resident within the system
var _ReadyQueue = []; // List of all PCBs ready within the system

var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

var _Canvas: HTMLCanvasElement;          // Initialized in Control.hostInit().
var _DrawingContext: any;                // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily: string = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize: number = 13;
var _FontHeightMargin: number = 4;       // Additional space added to font size when advancing a line.

var _Trace: boolean = true;              // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue: TSOS.Queue = null;
var _KernelInputQueue: TSOS.Queue = null; 
var _KernelBuffers = null; 

// Standard input and output
var _StdIn:  TSOS.Console = null; 
var _StdOut: TSOS.Console = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// Single Step Functionality
var _Step = false;
var _NextStep = false;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver: TSOS.DeviceDriverKeyboard  = null;
var _krnDiskDriver: TSOS.DeviceDriverDisk = null;

var _hardwareClockID: number = null;

// For testing (and enrichment)...
var Glados: any = null;  // This is the function Glados() in glados-ip*.js http://alanclasses.github.io/TSOS/test/ .
var _GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

var onDocumentLoad = function() {
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


