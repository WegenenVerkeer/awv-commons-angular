import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";

import {KaartModule} from "../lib/kaart/index";
import {AppComponent} from "./app.component";
import {FormsModule} from "@angular/forms";
import {GoogleLocatieZoekerModule} from "../lib/google-locatie-zoeker/index";
import {HttpModule} from "@angular/http";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    KaartModule.withDefaults(),
    FormsModule,
    GoogleLocatieZoekerModule.forRoot({
      // ssh tunnel naar apigateway van dev - ssh -L 5100:apigateway.dev.awv.internal:80 management.apps.mow.vlaanderen.be
      url: "http://apigateway:5100/locatiezoeker"
    }),
    HttpModule
  ],
  providers: [],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
