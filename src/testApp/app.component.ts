import {Component} from "@angular/core";
import {WmsKaartLaagConfig} from "../lib/kaart/wms-kaart-laag.config";

@Component({
  selector: "awv-commons-test-app",
  templateUrl: "./app.component.html"
})
export class AppComponent {
  orthoConfig: WmsKaartLaagConfig = {
    urls: ["http://geoservices.informatievlaanderen.be/raadpleegdiensten/omwrgbmrvl/wms"],
    layers: "Ortho",
    tiled: true,
    srs: "EPSG:31370",
    type: "WMS"
  };

  dienstkaartKleurConfig: WmsKaartLaagConfig = {
    urls: [
      "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
      "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
      "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
    ],
    layers: "dienstkaart-kleur",
    tiled: true,
    srs: "EPSG:31370",
    type: "WMS"
  };

  dienstkaartGrijsConfig: WmsKaartLaagConfig = {
    urls: [
      "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
      "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
      "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
    ],
    layers: "dienstkaart-grijs",
    tiled: true,
    srs: "EPSG:31370",
    type: "WMS"
  };

  ident8LabelsConfig: WmsKaartLaagConfig = {
    urls: [
      "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
      "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
      "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
    ],
    layers: "ident8",
    tiled: true,
    srs: "EPSG:31370",
    version: "1.1.1",
    type: "WMS"
  };

  referentiepuntenConfig: WmsKaartLaagConfig = {
    urls: [
      "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
      "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
      "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
    ],
    layers: "referentiepunten",
    tiled: true,
    srs: "EPSG:31370",
    version: "1.1.1",
    type: "WMS"
  };
}
