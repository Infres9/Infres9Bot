import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import  { MatButtonModule, MatSnackBarModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { BotControlService } from './bot-control.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    HttpClientModule,
    MatSnackBarModule,
    BrowserAnimationsModule
  ],
  providers: [BotControlService],
  bootstrap: [AppComponent]
})
export class AppModule { }
