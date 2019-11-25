import { Request, Response, Express } from 'express';
import Web3 from 'web3';

export interface Charger {
    price: number;
    accountID: String;
}

interface InternalCharger extends Charger {
    id: number
}

export class ChargerManager {
    private chargers: InternalCharger[];
    private idCounter: number;
    constructor(private app: Express) {
        this.chargers = [];
        this.idCounter = 1;
    }

    /**
     * registerRoutes
     */
    public registerRoutes() {
        this.app.get('/charger', this.routGetAllCharger);
        this.app.get('/charger/:id', this.reoutGetCharger);
        this.app.post('/charger', this.routCreateCharger);
        this.app.delete('/charger/:id', this.routDeleteCharger);
    }

    public getAllCharger() {
        return this.chargers;
    }

    public getCharger(id: number) {
        return this.chargers.find(x => x.id === id);
    }

    public createCharger(chargerData: Charger) {
        const charger: InternalCharger = Object.assign({ id: this.idCounter++ }, chargerData);
        this.chargers.push(charger);
        return charger;
    }

    public deleteCharger(id: number) {
        const count = this.chargers.length;
        this.chargers = this.chargers.filter(x => x.id !== id);
        return count === this.chargers.length
    }


    private routGetAllCharger = (req: Request, res: Response) => {
        res.send(this.getAllCharger());
    }

    private reoutGetCharger = (req: Request, res: Response) => {
        const id = this.validateChargerId(req, res);
        if (id === 0) { return; }
        const charger = this.getCharger(id);
        if (charger === undefined) {
            res.status(404).send(`No charger found with id ${id}`);
            return;
        }
        res.send(charger);
    }

    private routCreateCharger = (req: Request, res: Response) => {
        const priceParam = req.body.price
        const price = Number(priceParam);
        if (isNaN(price)) {
            res.status(400).send(`The given price is not a number! price value: ${priceParam}`);
            return;
        }

        const charger: Charger = {
            accountID: req.body.account,
            price
        };

        const result = this.createCharger(charger);
        if (typeof (result) === 'string') {
            res.status(400).send(result);
        } else {
            res.send(charger);
        }
    }

    private routDeleteCharger = (req: Request, res: Response) => {
        const id = this.validateChargerId(req, res);
        if (id === 0) { return; }

        // used guide: https://restfulapi.net/http-methods/#delete
        if (this.deleteCharger(id)) {
            res.status(404).send(`No charger found with id ${id}`);
        } else {
            res.status(204).send();
        }
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