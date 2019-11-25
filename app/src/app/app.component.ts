import { Component, Inject } from '@angular/core';
import { FormControl } from "@angular/forms";
import { WEB3 } from './share/web3';
import Web3 from "web3";

import * as dhbwCoinArtifact from '../../../build/contracts/FairCharger.json';
import { ChargeStickService } from './charge-stick.service.js';
import { Observable, interval } from 'rxjs';

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
  /**
   * UI Variables
   */
  title = 'FairCharger';
  showPriceInfo = false;
  showChargingInfo = false;
  showChargingSummary = false;
  statusText = "Bereit!";
  statusColor = "green";


  /*
  Car Information: Injected
  */
  simulation;
  charging = false;
  private carBatteryCap = 123;

  private carSOCPercent = 0;
  carSOCPercentOut = "";

  private carSOCAbsolute = 0;
  carSOCAbsoluteOut = "";

  

  private initialSOC = 0;

  private totalCharge = 0;
  totalChargeOut = "";

  private totalCost = 0;
  totalCostOut = "";

  /**
   * Account Information
   */
  currentBalance = "";
  private fairChargerContract;
  private account;

  chargeAccount;
  price = 0;

  /**
   * Update the Out-Values
   */
  private updateSOC() {
    this.carSOCPercent = this.carSOCAbsolute / this.carBatteryCap * 100;
    this.carSOCPercentOut = this.carSOCPercent.toFixed(2);
    this.totalCostOut = this.totalCost.toFixed(2);
    this.carSOCAbsoluteOut = this.carSOCAbsolute.toFixed(2);
    this.totalChargeOut = this.totalCharge.toFixed(2);
    
  }

  
  
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
        dhbwCoinArtifact.abi as any,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];

      this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
    this.updateSOC();
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
    if (chargerID !== undefined && chargerID !== "") {
      this.service.sendGetRequest("/charger/" + chargerID).subscribe(
        (data: any) => {
          this.showPriceInfo = true;
          this.price = data.price;
          this.chargeAccount = data.accountID;
          this.statusText = "Bereit";
          this.statusColor = "green";
        },
        (error) => {
          console.log('oops', error)
          this.statusText = "Bei der Verbindung zur Ladesäule ist ein Fehler aufgetreten";
          this.statusColor = "red";
        }
      );
    } else {
      alert("Bitte die Ladesäule angeben");
    }

  }

  declinePrice() {
    this.showPriceInfo = false;
    this.chargeAccount = null;
    this.price = null;
    this.carSOCPercent = 0;
    this.initialSOC = 0;
    this.totalCost = 0;
    this.updateSOC();
    this.endCharging();
    this.showChargingInfo = false;
    this.statusText = "Bereit";
    this.statusColor = "green";
  }

  startCharging() {
    this.carSOCPercent = 0;
    this.initialSOC = this.carSOCAbsolute;
    this.totalCost = 0;
    this.showChargingInfo = true;
    this.updateSOC();
    this.charging = true;
    this.statusText = "Lade...";
    this.statusColor = "green";
    this.simulation = interval(50)
      .subscribe((val) => {
        if (this.carSOCAbsolute >= this.carBatteryCap) {
          this.endCharging();
        } else {
          this.carSOCAbsolute += 0.001;
          this.totalCharge = this.carSOCAbsolute - this.initialSOC;
          this.totalCost = (this.carSOCAbsolute - this.initialSOC) * this.price;
          this.updateSOC();
        }
        //TODO: Pay
      });

  }


  endCharging() {
    if (this.simulation) {
      this.statusText = "Ladevorgang abgeschlossen! Vervollständige Zahlung";
      this.statusColor = "black";
      this.simulation.unsubscribe();
      //TODO: PAY
      this.statusText = "Zahlung erfolgreich";
      this.statusColor = "black";
      this.charging = false;
    }
    

  }
}