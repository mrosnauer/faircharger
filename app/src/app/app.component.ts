import { Component } from '@angular/core';
import { FormControl } from "@angular/forms";

import Web3 from "web3";

import * as dhbwCoinArtifact from '../../../build/contracts/FairCharger.json';

declare global {
  interface Window { web3: any; ethereum:any}
}

window.web3 = window.web3 || {};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'FairCharger';
  infoAndPrice = false;
  charging = false;
  currentBalance = "";
  private firstName:FormControl;
  private web3;
  private fairChargerContract;
  private account;


  
  ngOnInit() {
    if (window.ethereum) {
      // use MetaMask's provider
      this.web3 = new Web3(window.ethereum);
      window.ethereum.enable(); // get permission to access accounts
    } else {
      console.warn(
        "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(
        new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
      );
    }
    this.start();
  }

  public async start() {
    try {
      // get contract instance
      const networkId = await this.web3.eth.net.getId();
      const deployedNetwork = dhbwCoinArtifact.networks[networkId];
      this.fairChargerContract = new this.web3.eth.Contract(
        dhbwCoinArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];

      this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  }

  public async refreshBalance() {
    const { balanceOf, decimals } = this.fairChargerContract.methods;
    const balance = await balanceOf(this.account).call();
    const decimal = await decimals().call();

    this.currentBalance = `${balance/(Math.pow(10, decimal))}.${(balance % 100).toString().padStart(2, '0')}`;
  }

  public async sendCoin() {
    const amount = parseInt((<HTMLInputElement>document.getElementById("amount")).value);
    const receiver = (<HTMLInputElement>document.getElementById("receiver")).value;

    this.setStatus("Initiating transaction... (please wait)");

    const { transfer } = this.fairChargerContract.methods;
    await transfer(receiver, amount*100).send({ from: this.account });

    this.setStatus("Transaction complete!");
    this.refreshBalance();
  }

  public setStatus(message:any) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  }

  sendChargeRequest(title:string) {
    console.log(title);
  }

  

}
