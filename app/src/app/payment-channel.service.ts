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

  async init(web3: Web3, driverAccount, chargeStickAccount, maxVal, callback) {
    this.web3 = web3;
    let contracts: any = fairCharger;
    let abi = contracts.default.abi;
    let contract = new web3.eth.Contract(abi, null, { gas: 1000000 });
    //contract.transactionConfirmationBlocks = 1;
    let code = contracts.default.bytecode;


    const gas = await contract.deploy({ data: code, arguments: [chargeStickAccount, 100] }).estimateGas();
    const obj = await contract.deploy({ data: code, arguments: [chargeStickAccount, 100] });
    const obj2 = await obj.send({
      from: driverAccount,
      gas: gas + 1,
      value: maxVal
    }, callback);
    console.log("TE213123ST");
    return obj2;


    /*contract.deploy({
      data: code
    }).send({
      from: '0xc63a3709bD763ea9875505EBBA761E85FCE13f19',
      gas: 1500000,
      gasPrice: '30000000000000',
      value: maxVal
    }, (error, transactionHash) => {
      console.log("Error");
    }).on('error', function(error){ 
      console.log("ERROR");
    }).on('transactionHash', function(transactionHash){
      console.log("ERROR2");
     })
    .on('receipt', function(receipt){
       console.log(receipt.contractAddress) // contains the new contract address
    })
    .on('confirmation', function(confirmationNumber, receipt) {
      console.log("TEST345");
    })
    .then(function(newContractInstance){
        console.log(newContractInstance.options.address) // instance with the new contract address
    });*/


    /*.then(function (newContractInstance) {
      console.log(newContractInstance.options.address); // instance with the new contract address
      this.contractAddress = newContractInstance.options.address;
    }).catch((error) => {
      console.log(error);
    });*/

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
    return ethereumjs.soliditySHA3(["address", "uint"], [new BN(this.contractAddress.replace('x', ''), 16), amount]).toString('hex');
    return ethereumjs.soliditySHA3(
      ["address", "address", "uint", "uint"],
      [new BN("03d3ef18442361D220Cb14313D7B6e142dA276Ab", 16), 0, 1000, 1448075779]
    ).toString('hex');

  }


  // contractAddress is used to prevent cross-contract replay attacks.
  // amount, in wei, specifies how much ether should be sent.
  signPayment(amount, callback) {
    var message = this.constructPaymentMessage(amount);
    this.web3.eth.getAccounts((error, accounts) => {
      this.web3.eth.personal.sign("0x" + message.toString("hex"), accounts[0],
        callback);
    });
    ;
  }


}
