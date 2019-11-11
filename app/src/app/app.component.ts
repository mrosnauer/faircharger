import { Component, Inject } from '@angular/core';
import { FormControl } from "@angular/forms";
import { WEB3 } from './share/web3';
import Web3 from "web3";

import * as dhbwCoinArtifact from '../../../build/contracts/FairCharger.json';
import { ChargeStickService } from './charge-stick.service.js';

declare global {
  interface Window { web3: Web3; ethereum: any }
}


window.web3 = window.web3 || undefined;

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
  private firstName: FormControl;
  private fairChargerContract;
  private account;

  constructor(@Inject(WEB3) private web3: Web3, private service: ChargeStickService) {
  }

  ngOnInit() {
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

    this.currentBalance = `${balance / (Math.pow(10, decimal))}.${(balance % 100).toString().padStart(2, '0')}`;
  }

  public async sendCoin() {
    const amount = parseInt((<HTMLInputElement>document.getElementById("amount")).value);
    const receiver = (<HTMLInputElement>document.getElementById("receiver")).value;

    this.setStatus("Initiating transaction... (please wait)");

    const { transfer } = this.fairChargerContract.methods;
    await transfer(receiver, amount * 100).send({ from: this.account });

    this.setStatus("Transaction complete!");
    this.refreshBalance();
  }

  public setStatus(message: any) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  }

  sendChargeRequest(chargerID: string) {
    console.log(chargerID);

    this.infoAndPrice = true;
  }

  startCharging() {

  }

  declinePrice() {
    this.infoAndPrice = false;
  }

}
