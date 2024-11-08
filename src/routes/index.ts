import express from 'express';
import { getDataFromAPI } from '../controllers/apiController';

const router = express.Router();

// Serve the static HTML page
router.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// API endpoint to get posts based on the search term
router.get('/api/posts', async (req, res) => {
  const searchTerm = req.query.search as string || ''; // Default to an empty string
  const posts = await getDataFromAPI(searchTerm);
  res.json(posts); // Send posts as a JSON response
});

export default router;
