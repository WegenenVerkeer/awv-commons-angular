import {Component} from "@angular/core";
import * as ol from "openlayers";
import {GoogleLocatieZoekerService} from "../lib/google-locatie-zoeker/google-locatie-zoeker.service";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/operator/map";

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

  polygoonEvents: string[] = [];
  geoJsonFormatter = new ol.format.GeoJSON();

  pinIcon = new ol.style.Style({
    image: new ol.style.Icon({
      anchor: [0.5, 1],
      anchorXUnits: "fraction",
      anchorYUnits: "fraction",
      scale: 1,
      opacity: 1,
      src: "./material-design-icons/maps/svg/production/ic_place_48px.svg"
    }),
    text: new ol.style.Text({
      font: "12px 'Helvetica Neue', sans-serif",
      fill: new ol.style.Fill({color: "#000"}),
      offsetY: -60,
      stroke: new ol.style.Stroke({
        color: "#fff",
        width: 2
      }),
      text: "Zis is a pin"
    })
  });

  locatieQuery: string;
  features: ol.Collection<ol.Feature> = new ol.Collection();

  constructor(private googleLocatieZoekerService: GoogleLocatieZoekerService) {}

  polygoonGetekend(feature: ol.Feature) {
    this.polygoonEvents.push(this.geoJsonFormatter.writeFeature(feature));
  }

  zoekLocaties(locatieQuery: String) {
    this.googleLocatieZoekerService
      .zoek(locatieQuery)
      .flatMap(res => res.resultaten)
      .map(zoekresultaat => zoekresultaat.geometry)
      .map(geometry => new ol.Feature(geometry))
      .subscribe(feature => this.features.push(feature));
  }
}
