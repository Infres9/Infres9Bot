import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BotControlService {

  private botRestartUrl = "/bot/restart";

  constructor(private http : HttpClient)
   { }

   public restartBot() {
     return this.http.post(this.botRestartUrl,{});
   }

}
