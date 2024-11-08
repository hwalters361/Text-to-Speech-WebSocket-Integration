import express from 'express';
import path from 'path';
import router from './routes/index';

const app = express();
const port = process.env.PORT || 3000;

// Serve static files like HTML, CSS, and JS
app.use(express.static(path.join(__dirname, '../public')));

// Use the routes
app.use('/', router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
