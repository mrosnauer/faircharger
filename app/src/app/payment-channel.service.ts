import { Injectable } from '@angular/core';
import * as ethereumjs from 'ethereumjs-abi';
import * as Personal from 'web3-eth-personal';
import * as fs from "fs";

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
    let source = fs.readFileSync("contracts.json");
    let contracts = source.toJSON["contracts"];

    let abi = JSON.parse(contracts.SampleContract.abi);

    let contract = new web3.eth.Contract(abi, "0x8E8C5A8C9b866f77101C0054660A83A9A88D54c5", {gas: 1000000});
    let code = '0x' + contracts.SampleContract.bin;
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
    return ethereumjs.ABI.soliditySHA3(
      ["address", "uint256"],
      [this.contractAddress, amount],
    );
  }

  private signMessage(message, callback) {
    window.web3.eth.personal.sign("0x" + message.toString("hex"), window.web3.eth.defaultAccount,
      callback);
  }

  // contractAddress is used to prevent cross-contract replay attacks.
  // amount, in wei, specifies how much ether should be sent.
  signPayment(contractAddress, amount, callback) {
    var message = this.constructPaymentMessage(amount);
    this.signMessage(message, callback);
  }


}
