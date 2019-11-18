import express from 'express';
const app = express();
const port = 8080; // default port to listen

const cors = require('cors');

app.use(cors()); // Use this after the variable declaration

// define a route handler for the default home page
app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.get('/charger/24', (req, res) => {
    const dummyData = {
        accountID: '0x1827364',
        price:23
    };
    res.send(dummyData);
});

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
