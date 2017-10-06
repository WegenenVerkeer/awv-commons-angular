import {Component, ElementRef, Input, NgZone, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation} from "@angular/core";
import {KaartConfig} from "./kaart.config";

import * as ol from "openlayers";
import proj4 from "proj4";
import {CoordinatenService} from "./coordinaten.service";

@Component({
  selector: "awv-kaart",
  templateUrl: "./kaart.component.html",
  styleUrls: ["../../../node_modules/openlayers/css/ol.css", "./kaart.component.scss"],
  encapsulation: ViewEncapsulation.Native
})
export class KaartComponent implements OnInit, OnChanges {
  @ViewChild("map") mapElement: ElementRef;

  map: ol.Map;

  @Input() zoom = 2;
  @Input() minZoom = 2;
  @Input() maxZoom = 13;
  @Input() middelpunt: ol.Coordinate = [130000, 184000];
  @Input() breedte; // neem standaard de hele breedte in
  @Input() hoogte = 400;
  @Input() projectie = this.getDienstkaartProjectie();

  constructor(@Input() public config: KaartConfig, private zone: NgZone, private coordinatenService: CoordinatenService) {}

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.map = this.maakKaart();
      this.map.setSize([this.breedte, this.hoogte]);
      this.centreer();
      this.refresh();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.zone.runOutsideAngular(() => {
      if ("middelpunt" in changes) {
        this.centreer();
      }
      this.refresh();
    });
  }

  centreer() {
    setTimeout(() => {
      this.map.getView().setCenter(this.middelpunt);
    }, 0);
  }

  refresh() {
    setTimeout(() => {
      this.map.updateSize();
    }, 0);
  }

  maakKaart(): ol.Map {
    return new ol.Map(<olx.MapOptions>{
      controls: [],
      interactions: [],
      layers: [],
      pixelRatio: 1, // dit moet op 1 staan anders zal OL 512x512 tiles ophalen op retina displays en die zitten niet in onze geowebcache
      target: this.mapElement.nativeElement,
      logo: false,
      view: new ol.View({
        projection: this.projectie,
        center: [this.middelpunt[0], this.middelpunt[1]],
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        zoom: this.zoom
      })
    });
  }

  /**
   * Configureer Lambert72
   */
  getDienstkaartProjectie(): ol.proj.Projection {
    CoordinatenService.configureerLambert72();
    const dienstkaartProjectie: ol.proj.Projection = ol.proj.get("EPSG:31370");
    dienstkaartProjectie.setExtent([18000.0, 152999.75, 280144.0, 415143.75]); // zet de extent op die van de dienstkaart
    return dienstkaartProjectie;
  }

  zoomTo(extent: ol.geom.SimpleGeometry | ol.Extent): void {
    this.map.getView().fit(extent, {size: this.map.getSize()});
  }
}
