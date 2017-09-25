import {Component} from "@angular/core";

@Component({
  selector: "awv-commons-test-app",
  templateUrl: "./app.component.html"
})
export class AppComponent {
  agivWmsUrls = ["http://geoservices.informatievlaanderen.be/raadpleegdiensten/omwrgbmrvl/wms"];
  wdbWmsUrls = [
    "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
    "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
    "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
  ];
}
