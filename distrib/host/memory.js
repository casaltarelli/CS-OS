/* ------------
     Memory.ts

     Memory is used to create our Main Memory and initalizes it as empty
------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(totalSize, mainMemory) {
            if (totalSize === void 0) { totalSize = 256; }
            if (mainMemory === void 0) { mainMemory = []; }
            this.totalSize = totalSize;
            this.mainMemory = mainMemory;
        }
        Memory.prototype.init = function () {
            // Fill each memory with 00's to mark as empty
            for (var i = 0; i < this.totalSize; i++) {
                this.mainMemory[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
