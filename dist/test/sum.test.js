"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const sum_1 = require("../sum");
(0, globals_1.describe)('sum module', () => {
    (0, globals_1.test)('adds 1 + 2 to equal 3', () => {
        (0, globals_1.expect)((0, sum_1.sum)(1, 2)).toBe(3);
    });
});
