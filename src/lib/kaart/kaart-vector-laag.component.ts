import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {KaartComponent} from "./kaart.component";

import * as ol from "openlayers";

@Component({
  selector: "awv-kaart-vector-laag",
  template: "&nbsp;"
})
export class KaartVectorLaagComponent implements OnInit, OnDestroy {
  vectorLaag: ol.layer.Vector;

  @Input() titel = "";
  @Input() source = new ol.source.Vector();
  @Input() style: ol.style.Style;
  @Input() zichtbaar = true;
  @Input() selecteerbaar = true;
  @Input() hoverInteraction: ol.interaction.Interaction;
  @Input() selectInteraction: ol.interaction.Interaction;

  constructor(protected kaart: KaartComponent) {}

  ngOnInit(): void {
    this.vectorLaag = this.maakVectorLayer();

    this.kaart.map.addLayer(this.vectorLaag);

    if (this.hoverInteraction) {
      this.kaart.map.addInteraction(this.hoverInteraction);
    }

    if (this.selectInteraction) {
      this.kaart.map.addInteraction(this.selectInteraction);
    }
  }

  ngOnDestroy(): void {
    this.kaart.map.removeLayer(this.vectorLaag);

    if (this.hoverInteraction) {
      this.kaart.map.removeInteraction(this.hoverInteraction);
    }

    if (this.selectInteraction) {
      this.kaart.map.removeInteraction(this.selectInteraction);
    }
  }

  maakVectorLayer(): ol.layer.Vector {
    return new ol.layer.Vector(<olx.layer.VectorOptions>{
      title: this.titel,
      source: this.source,
      style: this.style,
      visible: this.zichtbaar,
      selectable: this.selecteerbaar,
      map: this.kaart.map
    });
  }
}
