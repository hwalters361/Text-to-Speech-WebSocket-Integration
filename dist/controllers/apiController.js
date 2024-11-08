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
exports.getDataFromAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const getDataFromAPI = (searchTerm) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // API URL
        const url = 'https://jsonplaceholder.typicode.com/posts';
        // If there's a search term, filter posts by title
        const response = yield axios_1.default.get(url);
        const posts = response.data;
        // Filter posts based on the search term (case-insensitive)
        const filteredPosts = posts.filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()));
        return filteredPosts;
    }
    catch (error) {
        console.error('Error fetching data from API:', error);
        return [];
    }
});
exports.getDataFromAPI = getDataFromAPI;
