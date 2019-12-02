import express from 'express';
import cors from 'cors';
import { ChargerManager } from './charger';

const app = express();
const port = 8080; // default port to listen


// Use this after the variable declaration
app.use(cors());

// middleware which parses a json body to an object if the header contains 'Content-Type: application/json'
app.use(express.json());

// define a route handler for the default home page
app.get('/', (req, res) => {
    res.send('Hello world!');
});

const chargerManager = new ChargerManager(app);
chargerManager.registerRoutes();
const result = chargerManager.createCharger({
    accountID: '0x0C5777CD1eB5753A82fF8Bd5ace695bd10EBBFef',
    price: 0.01
});
console.log(JSON.stringify(result));


// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
