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
const request = require("supertest");
const app = require("../app");
describe('Express app', () => {
    // Test homepage exists at /
    test('GET / should return status 200', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/');
        expect(response.status).toBe(200);
    }));
    // Test homepage exists at index.html
    test('GET /index.html should serve the static HTML file', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/index.html');
        expect(response.status).toBe(200);
        expect(response.header['content-type']).toMatch(/html/); // Ensure it's an HTML file
    }));
    // test is api responds with something (should replace this with a mock endpoint.)
    test('POST / should parse JSON body', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app)
            .post('/')
            .send({ text: "Hello World" })
            .set('Content-Type', 'application/json');
        expect(response.audio).toBeTruthy();
        expect(response.chars.length).toBeGreaterThanOrEqual(1);
        expect(response.charStartTimesMs.length).toBeGreaterThanOrEqual(1);
        expect(response.charDurationsMs.length).toBeGreaterThanOrEqual(1);
    }));
});
