import { Injectable } from '@angular/core';
import * as ethereumjs from 'ethereumjs-abi';
import * as Personal from 'web3-eth-personal';

import Web3 from "web3";

declare global {
  interface Window { web3: Web3; ethereum: any }
}

@Injectable({
  providedIn: 'root'
})
export class PaymentChannelService {

  constructor() { }

  initializePaymentChannels(senderAccount: any, receiverAccount: any, nonce: any) { 
    //const amount = parseInt((<HTMLInputElement>document.getElementById("amount")).value);
    /*const { claimPayment } = this.fairChargerContract.methods;
    await claimPayment(receiverAccount, amount, nonce).send({ from: this.account });

    this.setStatus("Payment sent!");
    this.refreshBalance();*/
  }

  private constructPaymentMessage(contractAddress, amount) {
    return ethereumjs.ABI.soliditySHA3(
      ["address", "uint256"],
      [contractAddress, amount],
    );
  }
  
  private signMessage(message, callback) {
    window.web3.eth.personal.sign("0x" + message.toString("hex"), window.web3.eth.defaultAccount,
      callback);
  }
  
  // contractAddress is used to prevent cross-contract replay attacks.
  // amount, in wei, specifies how much ether should be sent.
  signPayment(contractAddress, amount, callback) {
      var message = this.constructPaymentMessage(contractAddress, amount);
      this.signMessage(message, callback);
  }


}
