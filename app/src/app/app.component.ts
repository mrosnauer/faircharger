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

  private currentBalance = 0;
  currentBalanceOut = "";
  private remainingBalance = 0;
  remainingBalanceOut = "";

  private fairChargerContract;
  private account;

  chargerAccount;
  price = 0;

  /**
   * Update the Out-Values
   */
  private updateUI() {
    this.carSOCPercent = this.carSOCAbsolute / this.carBatteryCap * 100;
    this.carSOCPercentOut = this.carSOCPercent.toFixed(2);
    this.totalCostOut = this.totalCost.toFixed(2);
    this.carSOCAbsoluteOut = this.carSOCAbsolute.toFixed(2);
    this.totalChargeOut = this.totalCharge.toFixed(2);

    this.remainingBalanceOut = this.remainingBalance.toFixed(2);

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
    this.updateUI();
  }

  public async refreshBalance() {
    const { balanceOf, decimals } = this.fairChargerContract.methods;
    const balance = await balanceOf(this.account).call();
    const decimal = await decimals().call();
    const balanceF = parseFloat(balance) / Math.pow(10, decimal);

    this.currentBalanceOut = balanceF.toFixed(decimal);
    this.currentBalance = decimal;
  }

  public async send(amount: any) {
    this.statusText = "Initiating transaction... (please wait)";

    const { transfer } = this.fairChargerContract.methods;
    await transfer(this.chargerAccount, amount * 100).send({ from: this.account });
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
          this.chargerAccount = data.accountID;
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
    this.chargerAccount = null;
    this.price = null;
    this.carSOCPercent = 0;
    this.initialSOC = 0;
    this.totalCost = 0;
    this.updateUI();
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
    this.updateUI();
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
          this.remainingBalance = this.currentBalance - this.totalCost;
          this.updateUI();
        }
        //TODO: Pay
      });

  }


  endCharging() {
    if (this.simulation) {
      this.statusText = "Ladevorgang abgeschlossen! Vervollständige Zahlung";
      this.statusColor = "black";
      this.simulation.unsubscribe();
      this.totalCost = Math.round(this.totalCost * 100) / 100;
      this.send(this.totalCost.toFixed(2)).then(() => {
        this.statusText = "Zahlung erfolgreich";
        this.statusColor = "black";
      }).catch(() => {
        this.statusText = "Zahlung fehlerhaft";
        this.statusColor = "red";
      }).finally(() => {
        this.charging = false;
        this.showChargingInfo = false;
        this.refreshBalance();
      }); 

    }


  }
}