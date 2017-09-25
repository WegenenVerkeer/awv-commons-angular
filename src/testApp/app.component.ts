import {Component} from "@angular/core";
import * as ol from "openlayers";

declare function require(string): string; // TODO verbeter webpack fu

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

  pinIcon = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
      scale: 0.4,
      opacity: 1,
      src: require("./assets/pin.png")
    }),
    text: new ol.style.Text({
      font: "12px Calibri, sans-serif",
      fill: new ol.style.Fill({color: "#000"}),
      offsetY: -60,
      stroke: new ol.style.Stroke({
        color: "#fff",
        width: 2
      }),
      text: "Zis is a pin"
    })
  });
}
