import express from 'express';
import { ChargerManager } from './charger'

const app = express();
const port = 8080; // default port to listen

const cors = require('cors');

// Use this after the variable declaration
app.use(cors());

// middleware which parses a json body to an object if the header contains 'Content-Type: application/json'
app.use(express.json());

// define a route handler for the default home page
app.get('/', (req, res) => {
    res.send('Hello world!');
});

new ChargerManager(app).registerRoutes();


// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
