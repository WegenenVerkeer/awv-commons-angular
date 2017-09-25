import {AfterContentInit, Component, Input, OnDestroy, OnInit} from "@angular/core";
import {KaartComponent} from "./kaart.component";

import * as ol from "openlayers";

@Component({
  selector: "awv-kaart-wms-laag",
  template: "&nbsp;"
})
export class KaartWmsLaagComponent implements OnInit, OnDestroy {
  wmsLaag: ol.layer.Tile;

  @Input() titel = "";
  @Input() zichtbaar = true;
  @Input() wmsProjection?: ol.proj.Projection;
  @Input() wmsUrls: string[];
  @Input() wmsUrlLayers: string;
  @Input() wmsUrlTiled = true;
  @Input() wmsUrlSrs = "EPSG:31370";
  @Input() wmsVersion?: string;
  @Input() extent: ol.Extent = [18000.0, 152999.75, 280144.0, 415143.75];

  constructor(protected kaart: KaartComponent) {}

  ngOnInit(): void {
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
        urls: this.wmsUrls,
        params: {
          LAYERS: this.wmsUrlLayers,
          TILED: this.wmsUrlTiled,
          SRS: this.wmsUrlSrs,
          version: this.wmsVersion
        }
      })
    });
  }
}
