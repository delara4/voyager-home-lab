const express = require('express');

const app = express();
const host = '127.0.0.1';
const port = 3000;

app.get('/', (req, res) => {
    res.send('Welcome to the Voyager API');
});

app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok' });
});

app.listen(port, host, () => {
    console.log(`Voyager API listening at http://${host}:${port}`);
});
