import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";

import {KaartModule} from "../lib/kaart/index";
import {AppComponent} from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, KaartModule],
  providers: [],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
