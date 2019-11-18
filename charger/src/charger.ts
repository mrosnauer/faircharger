import { Express } from 'express';
import Web3 from 'web3';

interface ICharger {
    id: number;
    account: Web3;
}

class Changer {
    private charger: ICharger[] = [];
    constructor(private app: Express) {
    }

    /**
     * registerRoutes
     */
    public registerRoutes() {
        this.app.get('/charger');
    }
}