import {Component, Input, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {KaartComponent} from "./kaart.component";

import * as ol from "openlayers";

@Component({
  selector: "awv-kaart-wms-laag",
  template: "<ng-content></ng-content>",
  encapsulation: ViewEncapsulation.None
})
export class KaartWmsLaagComponent implements OnInit, OnDestroy {
  @Input() titel = "";
  @Input() zichtbaar = true;
  @Input() urls: string[];
  @Input() laag: string;
  @Input() tiles = true;
  @Input() srs = "EPSG:31370";
  @Input() versie?: string;
  @Input() extent: ol.Extent = [18000.0, 152999.75, 280144.0, 415143.75];

  wmsLaag: ol.layer.Tile;

  constructor(protected kaart: KaartComponent) {}

  ngOnInit(): void {
    if (!this.laag) {
      throw new Error("Geen laag gedefinieerd");
    }

    this.wmsLaag = this.maakWmsLayer();
    this.kaart.map.addLayer(this.wmsLaag);
  }

  ngOnDestroy(): void {
    this.kaart.map.removeLayer(this.wmsLaag);
  }

  maakWmsLayer(): ol.layer.Tile {
    return new ol.layer.Tile(<olx.layer.TileOptions>{
      title: this.titel,
      visible: this.zichtbaar,
      extent: this.extent,
      source: new ol.source.TileWMS({
        projection: null,
        urls: this.urls,
        params: {
          LAYERS: this.laag,
          TILED: this.tiles,
          SRS: this.srs,
          version: this.versie
        }
      })
    });
  }
}
