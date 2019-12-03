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

console.log(chargerManager.createCharger({
    accountID: '0x4Cc806EEaFD16e73b43DD201B6CB7122d1685cD5',
    price: 0.0001
}));


// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
