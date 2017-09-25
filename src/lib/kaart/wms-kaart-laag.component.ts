import {Component, Input} from "@angular/core";
import {WmsKaartLaagConfig} from "./wms-kaart-laag.config";
import {KaartLaagComponent} from "./kaart-laag.component";

import * as ol from "openlayers";

@Component({
  selector: "awv-wms-kaart-laag",
  template: "&nbsp;"
})
export class WmsKaartLaagComponent extends KaartLaagComponent {
  @Input() titel = "";
  @Input() type = "base";
  @Input() zichtbaar = true;
  @Input() extent: ol.Extent = [18000.0, 152999.75, 280144.0, 415143.75];
  @Input() wmsKaartLaagConfig: WmsKaartLaagConfig;

  toLayer(): ol.layer.Layer {
    return new ol.layer.Tile(<olx.layer.TileOptions>{
      title: this.titel,
      type: this.type,
      visible: this.zichtbaar,
      extent: this.extent,
      source: new ol.source.TileWMS({
        projection: null,
        urls: this.wmsKaartLaagConfig.urls,
        params: {
          LAYERS: this.wmsKaartLaagConfig.layers,
          TILED: this.wmsKaartLaagConfig.tiled,
          SRS: this.wmsKaartLaagConfig.srs,
          version: this.wmsKaartLaagConfig.version
        }
      })
    });
  }
}
