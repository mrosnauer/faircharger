import { Component } from '@angular/core';
import { FormControl } from "@angular/forms";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'FairCharger';
  infoAndPrice = false;
  charging = false;
  private firstName:FormControl;

  sendChargeRequest(title:string) {
    console.log(title);
  }
}
