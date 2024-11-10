"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware to parse JSON bodies
app.use(express_1.default.json()); // <-- This is the key middleware
// Serve static files like HTML, CSS, and JS
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
// Use the routes
app.use('/', index_1.default);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
module.exports = app;
