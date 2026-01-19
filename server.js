const express = require('express');
const scrapeModule = require('./api/scrape.js');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Handle POST requests to /api/scrape
app.post('/api/scrape', async (req, res) => {
    try {
          const result = await scrapeModule.default(req, res);
          return result;
    } catch (error) {
          console.error('Error in scrape endpoint:', error);
          res.status(500).json({ error: 'Failed to scrape' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
