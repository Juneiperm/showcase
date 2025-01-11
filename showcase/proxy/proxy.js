const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// Add a route to handle requests to the root URL
app.get('/', (req, res) => {
    res.send('Proxy server is running. Use /proxy?url=YOUR_URL to fetch content.');
});

app.get('/proxy', async (req, res) => {
    const url = req.query.url;
    const path = req.query.path || ''; // Get the path from query parameter, default to empty string
    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await axios.get(`${url}${path}`, {
            headers: { 'User-Agent': req.headers['user-agent'] }
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, '192.168.86.30', () => {
    console.log(`Proxy server running on http://192.168.86.30:${PORT}`);
});
