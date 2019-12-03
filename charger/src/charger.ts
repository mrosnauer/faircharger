import { Request, Response, Express } from 'express';
import Web3 from 'web3';
import * as dhbwCoinArtifact from '../../build/contracts/FairCharger.json';
import * as eUtils from 'ethereumjs-util';
import * as eAbi from 'ethereumjs-abi';

const ethereumjs = { Util: eUtils, ABI: eAbi };

export interface Charger {
    price: number;
    accountID: string;
}

interface InternalCharger extends Charger {
    id: number;
    //last valid payment for each sender accountID
    lastValidPayment: { amount: number; message: string };
}

export class ChargerManager {
    private chargers: InternalCharger[];
    private idCounter: number;
    private web3: Web3;
    private fairChargerContract: any;

    constructor(private app: Express) {
        this.chargers = [];
        this.idCounter = 1;
        this.web3 = new Web3(
            new Web3.providers.HttpProvider('http://localhost:7545')
        );
        this.setupChain();
    }

    /**
     * connect to the chain.
     */
    private async setupChain() {
        try {
            const networkId = await this.web3.eth.net.getId();

            // this hack is needed to satisfy typescript.
            const networks: any = dhbwCoinArtifact.networks;
            const deployedNetwork = networks[networkId];

            this.fairChargerContract = new this.web3.eth.Contract(
                dhbwCoinArtifact.abi as any,
                deployedNetwork.address
            );
            console.log('chain connection doen');
        } catch (error) {
            console.error(error);
            console.log(
                'something went wrong while setting up the chain connection'
            );
        }
    }

    /**
     * registerRoutes
     */
    public registerRoutes(): void {
        this.app.get('/charger', this.routGetAllCharger);
        this.app.post('/charger', this.routCreateCharger);
        this.app.get('/charger/:id', this.routGetCharger);
        this.app.put('/charger/:id', this.routUpdateCharger);
        this.app.delete('/charger/:id', this.routDeleteCharger);
        this.app.post('/charger/:id/pay', this.payWrap);
    }

    public getAllCharger() {
        return this.chargers;
    }

    public getCharger(id: number) {
        return this.chargers.find(x => x.id === id);
    }

    public createCharger(chargerData: Charger) {
        const charger: InternalCharger = Object.assign(
            {
                id: this.idCounter++,
                lastValidPayment: { amount: 0, message: '' }
            },
            chargerData
        );
        this.chargers.push(charger);
        return charger;
    }

    public updateCharger(newChargerData: Charger, id: number) {
        const charger = this.chargers.find(x => x.id === id);
        if (charger === undefined) {
            return false;
        }
        charger.accountID = newChargerData.accountID;
        charger.price = newChargerData.price;
        return true;
    }

    //Delete an existing charger.
    public deleteCharger(id: number) {
        const count = this.chargers.length;
        this.chargers = this.chargers.filter(x => x.id !== id);
        return count === this.chargers.length;
    }

    /**
     * convert an internal to an external charger.
     * @param charger external object
     */
    private reduce(charger: InternalCharger): Charger {
        return { price: charger.price, accountID: charger.accountID };
    }

    private routGetAllCharger = (req: Request, res: Response) => {
        res.send(this.getAllCharger().map(this.reduce));
    };

    private routGetCharger = (req: Request, res: Response) => {
        const id = this.validateChargerId(req, res);
        if (id === 0) {
            return;
        }
        const charger = this.getCharger(id);
        if (charger === undefined) {
            res.status(404).send(`No charger found with id ${id}`);
            return;
        }
        res.send(this.reduce(charger));
    };

    private routUpdateCharger = (req: Request, res: Response) => {
        const id = this.validateChargerId(req, res);
        if (id === 0) {
            return;
        }

        const newChargerData = req.body;
        if (this.updateCharger(newChargerData, id) === false) {
            res.status(404).send(`No charger found with id ${id}`);
            return;
        }
        res.send();
    };

    private routCreateCharger = (req: Request, res: Response) => {
        const priceParam = req.body.price;
        const price = Number(priceParam);
        if (isNaN(price)) {
            res.status(400).send(
                `The given price is not a number! price value: ${priceParam}`
            );
            return;
        }

        const charger: Charger = {
            accountID: req.body.account,
            price
        };

        const result = this.createCharger(charger);
        if (typeof result === 'string') {
            res.status(400).send(result);
        } else {
            res.send(this.reduce(result));
        }
    };

    private routDeleteCharger = (req: Request, res: Response) => {
        const id = this.validateChargerId(req, res);
        if (id === 0) {
            return;
        }

        // used guide: https://restfulapi.net/http-methods/#delete
        if (this.deleteCharger(id)) {
            res.status(404).send(`No charger found with id ${id}`);
        } else {
            res.status(204).send();
        }
    };

    // Checks for valid charger ID.
    private validateChargerId = (req: Request, res: Response) => {
        const idParam = req.params.id;
        const id = Number(idParam);
        if (isNaN(id)) {
            res.status(400).send(
                `The ID after /charger/ was not a number! value: ${idParam}`
            );
            return 0;
        } else if (id <= 0) {
            res.status(400).send(
                `The ID after /charger/ is not allowed to be smaller than 1! value ${id}`
            );
        }
        return id;
    };

    /**
     * wraps the pay method to close the connection if something goes wrong and handle errors.
     */
    private payWrap = async (req: Request, res: Response) => {
        try {
            const id = this.validateChargerId(req, res);
            if (id === 0) {
                return;
            }

            const charger = this.getCharger(id);
            if (charger === undefined) {
                res.status(404).send(`No charger found with id ${id}`);
                return;
            }

            if ((await this.pay(req, res, charger)) === undefined) {
                const { close } = this.fairChargerContract.methods;
                await close(
                    charger.lastValidPayment.amount,
                    charger.lastValidPayment.message
                );
            } else {
                res.status(200).send();
            }
        } catch (error) {
            console.error(error);
            console.log('some error in payWrap happend');
        }
    };

    private pay = async (
        req: Request,
        res: Response,
        charger: InternalCharger
    ): Promise<boolean | undefined> => {
        const messageParam = req.body.message;
        const countParam = req.body.count;
        if (messageParam === undefined) {
            res.status(400).send('No message in request body!');
            return;
        }
        if (countParam === undefined) {
            res.status(400).send('No count in request body!');
            return;
        }
        const count = Number(countParam);
        if (isNaN(count)) {
            res.status(400).send(`Count is not a number! value: ${countParam}`);
            return;
        }
        if (count < 0) {
            res.status(400).send(
                `Count cannot be smaller than 0! value: ${count}`
            );
            return;
        }

        // this calculation should be done by reading the creation datetime of the opening transaction
        // with this it is not needed to extract the datetime, but its not safe
        const amount = count * charger.price;
        const { isValidSignature } = this.fairChargerContract.methods;

        // only return true if the message is valid
        if (await isValidSignature(messageParam, amount)) {
            charger.lastValidPayment = { amount, message: messageParam };
            return true;
        }
        res.status(400).send('the message is not valid');
    };
}
