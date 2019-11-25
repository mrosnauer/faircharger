import { Request, Response, Express } from 'express';
import Web3 from 'web3';

interface ICharger {
    id: number;
    account: Web3;
}

export class ChargerManager {
    private chargers: ICharger[] = [];
    private idCounter = 1;
    constructor(private app: Express) {
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

    private getAllCharger(req: Request, res: Response) {
        res.send(this.chargers);
    }

    private getCharger(req: Request, res: Response) {
        const id = this.validateChargerId(req, res);
        if (id === 0) { return; }
        const charger = this.chargers.find(x => x.id === id);
        if (charger === undefined) {
            res.status(404).send(`No charger found with id ${id}`);
            return;
        }
        res.send(charger);
    }

    private createCharger(req: Request, res: Response) {
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

    private deleteCharger(req: Request, res: Response) {
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

    private validateChargerId(req: Request, res: Response) {
        const idParam = req.params.id;
        try {
            return Number(idParam);
        } catch (error) {
            res.status(400).send(`The ID after /charger/ was not a number! value: ${idParam}`);
            return 0;
        }
    }
}