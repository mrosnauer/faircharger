import { Injectable } from '@angular/core';

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
}
