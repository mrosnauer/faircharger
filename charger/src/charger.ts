import { Request, Response, Express } from 'express';
import Web3 from 'web3';

interface Charger {
    id: number;
    account: Web3;
}

export class ChargerManager {
    private chargers: Charger[];
    private idCounter: number;
    constructor(private app: Express) {
        this.chargers = [];
        this.idCounter = 1;
    }

    /**
     * registerRoutes
     */
    public registerRoutes() {
        this.app.get('/charger', this.getAllCharger);
        this.app.get('/charger/:id', this.getCharger);
        this.app.post('/charger', this.createCharger);
        this.app.delete('/charger/:id', this.deleteCharger);
    }

    public getAllCharger = (req: Request, res: Response) => {
        res.send(this.chargers);
    }

    public getCharger = (req: Request, res: Response) => {
        const id = this.validateChargerId(req, res);
        if (id === 0) { return; }
        const charger = this.chargers.find(x => x.id === id);
        if (charger === undefined) {
            res.status(404).send(`No charger found with id ${id}`);
            return;
        }
        res.send(charger);
    }

    public createCharger = (req: Request, res: Response) => {
        const accountParam = req.body.account;
        if (Web3.utils.isAddress(accountParam) === false) {
            res.status(400).send(`The give account is not valid! account value: ${accountParam}`);
            return;
        }
        const charger = {
            id: this.idCounter++,
            account: accountParam
        };
        this.chargers.push(charger);
        res.send(charger);
    }

    public deleteCharger = (req: Request, res: Response) => {
        const id = this.validateChargerId(req, res);
        if (id === 0) { return; }

        const count = this.chargers.length;
        this.chargers = this.chargers.filter(x => x.id !== id);

        // used guide: https://restfulapi.net/http-methods/#delete
        if (count === this.chargers.length) {
            res.status(404).send(`No charger found with id ${id}`);
            return;
        }
        res.status(204).send();
    }

    private validateChargerId = (req: Request, res: Response) => {
        const idParam = req.params.id;
        const id = Number(idParam);
        if (isNaN(id)) {
            res.status(400).send(`The ID after /charger/ was not a number! value: ${idParam}`);
            return 0;
        }
        return id;
    }
}