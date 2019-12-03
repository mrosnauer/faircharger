import { Component, Inject } from '@angular/core';
import { FormControl } from "@angular/forms";
import { WEB3 } from './share/web3';
import Web3 from "web3";

import * as dhbwCoinArtifact from '../../../build/contracts/FairCharger.json';
import { ChargeStickService } from './charge-stick.service.js';
import { Observable, interval } from 'rxjs';
import { PaymentChannelService } from './payment-channel.service';
import { TouchSequence } from 'selenium-webdriver';
import { Contract } from 'web3-eth-contract';
var BN = require('bn.js')

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
  simulate = false;
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

  //charger infos
  chargerAccount;
  chargerID;
  price = 0;

  //Counts transactions
  count = 1;

  /**
   * Update the UI -> calculate string values
   */
  private updateUI() {
    this.carSOCPercent = this.carSOCAbsolute / this.carBatteryCap * 100;
    this.carSOCPercentOut = this.carSOCPercent.toFixed(2);
    this.totalCostOut = this.totalCost.toFixed(5);
    this.carSOCAbsoluteOut = this.carSOCAbsolute.toFixed(2);
    this.totalChargeOut = this.totalCharge.toFixed(2);
    this.remainingBalanceOut = this.remainingBalance.toFixed(2);
  }



  /**
   * Dependency injection
   * @param web3 web3
   * @param service service to communicate to the backend
   * @param paymentService service to do payment channel
   */
  constructor(@Inject(WEB3) private web3: Web3, private service: ChargeStickService, private paymentService: PaymentChannelService) {
  }

  /**
   * ngOnInit-called when page loads
   */
  ngOnInit() {
    this.start();
    this.simulation = interval(10).subscribe((val) => {
      if (this.simulate) {
        if (this.carSOCAbsolute >= this.carBatteryCap) {
          this.endCharging();
        } else {
          const charged = 0.001;
          
          //Simulate charging
          this.carSOCAbsolute += charged;
          this.totalCharge = this.carSOCAbsolute - this.initialSOC;
          this.totalCost = (this.carSOCAbsolute - this.initialSOC) * this.price;
          this.remainingBalance = this.currentBalance - this.totalCost;
          this.updateUI();

          //Pay and send to charge stick (off-chain)
          /*this.paymentService.signPayment(charged * this.price * 1000000000000000000, (error, result) => {
            console.log(result);
            this.service.sendPostRequest("/charger/" + this.chargerID + "/pay", {
                message: result,
                count: this.count

            }).subscribe(
              (data: any) => {
              },
              (error) => {
                this.statusText = "Bei der Zahlungsübertragung zur Ladesäule ist ein Fehler aufgetreten";
                this.statusColor = "red";
              }
            );
          });*/

          this.count++;
        }
      }
    });
  }

  /**
   * Setup the connection to the blockchain
   */
  private async setupChainConnection() {
    const networkId = await this.web3.eth.net.getId();
    const deployedNetwork = dhbwCoinArtifact.networks[networkId];
    this.fairChargerContract = new this.web3.eth.Contract(
      dhbwCoinArtifact.abi as any,
      deployedNetwork.address,
    );

    await this.web3.eth.getAccounts((error, accounts) => {
      this.account = accounts[0];
    });

  }

  /**
   * Method to be called when page loads. Setup blockchain connection
   */
  public async start() {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        await this.setupChainConnection();
        //await this.refreshBalance();

        // Acccounts now exposed
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider);
      this.setupChainConnection();
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
    this.updateUI();
  }

  /**
   * Refreshes the balance
   */
  public async refreshBalance() {
    const { balanceOf, decimals, name } = this.fairChargerContract.methods;
    const nameT = await name().call();
    const balance = await balanceOf(this.account).call({ from: this.account });
    const decimal = await decimals().call();
    const balanceF = parseFloat(balance) / Math.pow(10, decimal);

    this.currentBalanceOut = balanceF.toFixed(decimal);
    this.currentBalance = decimal;
  }


  /**
   * Sends a request to a charger with a specific ID
   * @param chargerID the ID of the charger
   */
  sendChargeRequest(chargerID: string) {
    this.chargerID = chargerID;
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
          this.statusText = "Bei der Verbindung zur Ladesäule ist ein Fehler aufgetreten";
          this.statusColor = "red";
        }
      );
    } else {
      alert("Bitte die Ladesäule angeben");
    }
  }

  /**
   * Button-Handler: User declines price
   * Resets all UI-Values
   */
  declinePrice() {
    this.showPriceInfo = false;
    this.chargerAccount = null;
    this.price = null;
    this.carSOCPercent = 0;
    this.initialSOC = 0;
    this.totalCost = 0;
    this.updateUI();
    this.showChargingInfo = false;
    this.statusText = "Bereit";
    this.statusColor = "green";
  }

  /**
   * Callback-Handler after deploying payment channel contract
   * @param err error, if existing
   */
  callback(err) {
    if (err == null) {
      this.paymentService.contractAddress = window.prompt("Bitte die Adresse des Contracts aus Ganache kopieren und hier einfügen","0xAB...");
  
      //Reset all values
      this.charging = true;
      this.simulate = true;
      this.showChargingInfo = true;
      this.statusText = "Lade";
      this.statusColor = "green";
      this.initialSOC = this.carSOCAbsolute;
      this.totalCost = 0;

    } else {
      this.statusText = "Bei dem Deployment des Contracts ist ein Fehler aufgetreten:" + err;
      this.statusColor = "red";
    }
  }

  /**
   * Button-Handler: Starte den Ladevorgang
   */
  startCharging() {
    //Statustext setzen
    this.statusText = "Öffne Payment Channel...";
    this.statusColor = "black";
    //Schätze Ladekosten
    const maxCost = (this.carBatteryCap - this.carSOCAbsolute) * this.price;
    
    //Behelfs-Callback, wegen Problem unten
    const callback = (err, transactionHash) => {
      this.callback(err);
    }

    //Öffne Payment Channel
    //Callback wird nicht aufgerufen...
    this.paymentService.init(this.web3, this.account, this.chargerAccount, maxCost * 1000000000000000000, callback).then((value:Contract) => {
      //DAS HIER WIRD NICHT AUFGERUFEN
      //Siehe https://github.com/ethereum/web3.js/issues/2104
      this.callback(null);
    }, (err:any) => {
      this.callback(err);
      //this.callback(null);
      //DAS HIER AUCH NICHT...
      //Siehe https://github.com/ethereum/web3.js/issues/2104
    });
  }

  /**
   * Called when the charge process ended. (Button handler)
   */
  endCharging() {
    //Stop simulation if running
    if (this.simulate) {
      this.statusText = "Ladevorgang abgeschlossen!";
      this.statusColor = "black";
      this.simulate = false;    
    }
  }
}