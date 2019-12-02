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

  private contractAddress;
  private web3;

  init(web3: Web3) {
    this.web3 = web3;
    let contracts:any = fairCharger;
    let abi = contracts.default.abi
    this.contractAddress = "0x8E8C5A8C9b866f77101C0054660A83A9A88D54c4";
    let contract = new web3.eth.Contract(abi, this.contractAddress, {gas: 1000000});
    let code = '0x' + contracts.default.bytecode;
    contract.deploy({
      data: code
    });
  }

  initializePaymentChannels(senderAccount: any, receiverAccount: any, nonce: any) {
    //const amount = parseInt((<HTMLInputElement>document.getElementById("amount")).value);
    /*const { claimPayment } = this.fairChargerContract.methods;
    await claimPayment(receiverAccount, amount, nonce).send({ from: this.account });

    this.setStatus("Payment sent!");
    this.refreshBalance();*/
  }

  private constructPaymentMessage(amount) {
    /*return ethereumjs.soliditySHA3(
      ["address", "uint256"],
      [this.contractAddress, amount],
    );*/
    return ethereumjs.soliditySHA3(["address","uint"], [new BN(this.contractAddress.replace('x',''),16), amount]).toString('hex');
    return ethereumjs.soliditySHA3(
      [ "address", "address", "uint", "uint" ],
      [ new BN("03d3ef18442361D220Cb14313D7B6e142dA276Ab", 16), 0, 1000, 1448075779 ]
    ).toString('hex');
    
  }


  // contractAddress is used to prevent cross-contract replay attacks.
  // amount, in wei, specifies how much ether should be sent.
  signPayment(amount, callback) {
    var message = this.constructPaymentMessage(amount);
    this.web3.eth.getAccounts((error, accounts) => {
      this.web3.eth.personal.sign("0x" + message.toString("hex"),accounts[0] ,
      callback);
    });
    ;
  }


}
