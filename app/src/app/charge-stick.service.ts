import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChargeStickService {

  constructor(private httpClient: HttpClient) { }

  private REST_API_SERVER = "http://localhost:8080";

  public sendGetRequest(endpoint:string){
    return this.httpClient.get(this.REST_API_SERVER + endpoint);
  }

  public sendPostRequest(endpoint:string, data){
    return this.httpClient.post(this.REST_API_SERVER + endpoint,JSON.stringify(data));
  }
}
