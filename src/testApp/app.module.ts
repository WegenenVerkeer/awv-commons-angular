import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";

import {KaartModule} from "../lib/kaart/index";
import {AppComponent} from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    KaartModule.forRoot({
      orthofotosWmsUrls: ["http://geoservices.informatievlaanderen.be/raadpleegdiensten/omwrgbmrvl/wms"],
      dienstkaartKleurWmsUrls: [
        "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
      ],
      dienstkaartGrijsWmsUrls: [
        "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
      ],
      ident8LabelsWdbWmsUrls: [
        "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
      ],
      referentiepuntenWdbWmsUrls: [
        "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
      ]
    })
  ],
  providers: [],
  entryComponents: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
