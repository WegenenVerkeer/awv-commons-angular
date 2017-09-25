import {Component, Input} from "@angular/core";
import {KaartLaagConfig} from "./kaart-laag.config";
import {WmsKaartLaagConfig} from "./wms-kaart-laag.config";

import * as ol from "openlayers";

@Component({
  selector: "awv-kaart-laag",
  template: "&nbsp;"
})
export class KaartLaagComponent {
  @Input() titel = "";
  @Input() zichtbaar = true;
  @Input() extent: ol.Extent = [18000.0, 152999.75, 280144.0, 415143.75];
  @Input() kaartLaagConfig: KaartLaagConfig;

  toLayer(): ol.layer.Layer {
    if (this.kaartLaagConfig.type === "WMS") {
      return this.toWmsLayer(<WmsKaartLaagConfig>this.kaartLaagConfig);
    } else {
      throw new Error("Onbekend laagtype gedefinieerd");
    }
  }

  toWmsLayer(config: WmsKaartLaagConfig): ol.layer.Tile {
    return new ol.layer.Tile(<olx.layer.TileOptions>{
      title: this.titel,
      visible: this.zichtbaar,
      extent: this.extent,
      source: new ol.source.TileWMS({
        projection: null,
        urls: config.urls,
        params: {
          LAYERS: config.layers,
          TILED: config.tiled,
          SRS: config.srs,
          version: config.version
        }
      })
    });
  }
}
