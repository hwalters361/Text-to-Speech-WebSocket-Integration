"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiController_1 = require("../controllers/apiController");
const router = express_1.default.Router();
// Serve the static HTML page
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});
// API endpoint to get posts based on the search term
router.get('/api/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchTerm = req.query.search || ''; // Default to an empty string
    const posts = yield (0, apiController_1.getDataFromAPI)(searchTerm);
    res.json(posts); // Send posts as a JSON response
}));
exports.default = router;
