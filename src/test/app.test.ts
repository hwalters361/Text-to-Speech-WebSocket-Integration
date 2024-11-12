const request = require("supertest");
const app = require("../app");

describe('Express app', () => {

  // Test homepage exists at /
  test('GET / should return status 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  // Test homepage exists at index.html
  test('GET /index.html should serve the static HTML file', async () => {
    const response = await request(app).get('/index.html');
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toMatch(/html/); // Ensure it's an HTML file
  });

  // test is api responds with something (should replace this with a mock endpoint.)
  test('POST / should parse JSON body', async () => {
    const response = await request(app)
      .post('/')
      .send({ text: "Hello World" })
      .set('Content-Type', 'application/json');
    
    expect(response.audio).toBeTruthy();
    expect(response.chars.length).toBeGreaterThanOrEqual(1);
    expect(response.charStartTimesMs.length).toBeGreaterThanOrEqual(1);
    expect(response.charDurationsMs.length).toBeGreaterThanOrEqual(1);
  });
});

