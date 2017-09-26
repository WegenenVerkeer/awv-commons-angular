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
    KaartModule,
    FormsModule,
    GoogleLocatieZoekerModule.forRoot({
      url: "https://apps.mow.vlaanderen.be/locatiezoeker"
    }),
    HttpModule
  ],
  providers: [],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
