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

  init(web3: Web3, maxVal) {
    console.log("TESTER");
    this.web3 = web3;
    let contracts: any = fairCharger;
    let abi = contracts.default.abi;
    let contract = new web3.eth.Contract(abi, null, { gas: 1000000 });
    //contract.transactionConfirmationBlocks = 1;
    let code = contracts.default.bytecode;

    const deploy = async () => {
      const gas = await contract.deploy({ data: code, arguments: ["0x4Cc806EEaFD16e73b43DD201B6CB7122d1685cD5", 100] }).estimateGas();
      console.log(gas);
      const response = await contract.deploy({ data: code, arguments: ["0x4Cc806EEaFD16e73b43DD201B6CB7122d1685cD5", 100] }).send({
        from: '0xA25758d9ec1EE1FEaeE1dE552e279599638ABDB3',
        gas: gas + 1,
        value: maxVal
      });

      console.log('Contract deployed to:', response.options.address);

      return response;
    };

    deploy().then((contractClone) => {
      console.log('CLONED-CONTRACT: ', contractClone);

    }).catch(console.log);

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
