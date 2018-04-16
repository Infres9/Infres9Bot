import { Component } from '@angular/core';
import { BotControlService } from './bot-control.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  isRestartingbot : boolean = false;

  constructor(private mbotControl : BotControlService, private snackbar : MatSnackBar){

  }

  restartBot(){
    this.isRestartingbot = true;
    this.mbotControl
        .restartBot()
        .pipe(catchError(this.handleRequestError.bind(this)))
        .subscribe(this.confirmBotRestart.bind(this));
  }

  private confirmBotRestart(data){
    if(data["success"] && data["success"] === true){
      this.snackbar.open("Bot restarted !", ":)", {duration : 2000});
    }else{
      this.snackbar.open("Failed to restart bot", ":(", {duration : 2000});
    }
    this.isRestartingbot = false;
  }

  private handleRequestError(error : HttpErrorResponse){
    if(error.error instanceof ErrorEvent){
      console.error('Error occured');
    }else{
      console.error(`Server status : ${error.status}`);
    }

    this.isRestartingbot = false;

    return new ErrorObservable("Une erreur est survenue ...");
  }

}
