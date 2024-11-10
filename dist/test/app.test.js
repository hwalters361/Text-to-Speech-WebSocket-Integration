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
// import request from 'supertest';
// import app from '../app'; // Adjust this path to where your app.ts is located
const request = require("supertest");
const app = require("../app");
describe('Express app', () => {
    // Test if the app is running and responds with a status 200
    test('GET / should return status 200', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/');
        expect(response.status).toBe(200);
    }));
    // Test if a static file is being served (assuming public/index.html exists)
    test('GET /index.html should serve the static HTML file', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/index.html');
        expect(response.status).toBe(200);
        expect(response.header['content-type']).toMatch(/html/); // Ensure it's an HTML file
    }));
    // Test if the JSON body is being parsed correctly
    test('POST / should parse JSON body', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app)
            .post('/')
            .send({ text: "Hello World" })
            .set('Content-Type', 'application/json');
        expect(response.audio).toBeTruthy();
        expect(response.chars.length).toBeGreaterThanOrEqual(1);
        expect(response.charStartTimesMs.length).toBeGreaterThanOrEqual(1);
        expect(response.charDurationsMs.length).toBeGreaterThanOrEqual(1);
        // Adjust this part based on what the POST route actually does
    }));
    // Test a route defined in your `router` (example route /api/hello)
    test('GET /api/hello should return a hello message', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/api/hello');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Hello, world!');
    }));
});
