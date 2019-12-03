import { Injectable } from '@angular/core';
import * as ethereumjs from 'ethereumjs-abi';
import * as Personal from 'web3-eth-personal';
import * as fairCharger from '../../../build/contracts/FairCharger.json';
var BN = require('bn.js')

import Web3 from "web3";

declare global {
  interface Window { web3: Web3; ethereum: any }
}

@Injectable({
  providedIn: 'root'
})
export class PaymentChannelService {

  constructor() { }

  contractAddress;
  private web3;

  /**
   * Setup Payment channel
   * @param web3 web3 to be injected
   * @param driverAccount the account of the driver
   * @param chargeStickAccount the account of the charge stick owner
   * @param maxVal the maximum value. The Contract will be funded with this amount
   * @param callback callback function
   */
  async init(web3: Web3, driverAccount, chargeStickAccount, maxVal, callback) {
    console.log("DEPLOY");
    this.web3 = web3;
    let contracts: any = fairCharger;
    let abi = contracts.default.abi;
    let contract = new web3.eth.Contract(abi, null, { gas: 1000000 });
    let code = contracts.default.bytecode;

    //Estimate Gas cost
    console.log(driverAccount);
    const gas = await contract.deploy({ data: code, arguments: [chargeStickAccount, 100] }).estimateGas();
    //Deploy contract
    const obj = await contract.deploy({ data: code, arguments: [chargeStickAccount, 100] });
    //Send contract
    const obj2 = await obj.send({
      from: driverAccount,
      gas: gas + 1,
      value: maxVal
    }, () => callback());
    //On our machine, web3 was not passing the await ans infinitely stuck. See Github link
    return obj2;
  }

  // contractAddress is used to prevent cross-contract replay attacks.
  // amount, in wei, specifies how much ether should be sent.
  signPayment(amount, callback) {
    var message = ethereumjs.soliditySHA3(["address", "uint"], [new BN(this.contractAddress.replace('x', ''), 16), amount]).toString('hex');
    this.web3.eth.getAccounts((error, accounts) => {
      this.web3.eth.personal.sign("0x" + message.toString("hex"), accounts[0],
        callback);
    });
    ;
  }


}
