# Text-to-Speech-WebSocket-Integration

### Run the test script
Install dependencies
Create a `.env` file in the root directory that contains your API key in the form:
```
ELEVENLABS_API_KEY= your_key_here
```
You might have to compile the typescript after adding your API key.
You can do this by going to `src` and running `npx tsc`, then going to the `client` directory and running `npx tsc` again. This should put the compiled javascript in the `dist` folder.

Run `node dist/app.js` from the root directory to launch the app and open localhost port 3000.

### Testing
Uses jest. Run `npm test` from the root directory. 

#### Decisions/Tradeoffs

I used Express instead of WebSocket, and I did not see websocket was requested until I was so far deep in this project that I could no longer change it. I tried to stay true to the 10 hour limit but I definitely went over. One API call is made per transcript submitted.

I only wrote tests for `TTS.ts`, although I tried to write tests for `app.ts` but was having issues with the supertest package, which is what I was using to test.

##### Final notes
This was very fun to implement! 

If there are any issues with starting up this program let me know.
