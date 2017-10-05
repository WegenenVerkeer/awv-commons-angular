import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from "@angular/core";
import {KaartComponent} from "./kaart.component";
import {KaartVectorLaagComponent} from "./kaart-vector-laag.component";

import * as ol from "openlayers";

@Component({
  selector: "awv-kaart-teken-polygoon-laag",
  template: "<ng-content></ng-content>",
  encapsulation: ViewEncapsulation.None
})
export class KaartTekenPolygoonLaagComponent extends KaartVectorLaagComponent implements OnInit, OnDestroy {
  @Input() feature: ol.Feature;
  @Output() polygonGetekend = new EventEmitter<ol.Feature>();

  tekenPolygoonInteraction: ol.interaction.Interaction;

  constructor(protected kaart: KaartComponent) {
    super(kaart);

    this.source = new ol.source.Vector({wrapX: false});
    this.titel = "Poly";
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.tekenPolygoonInteraction = new ol.interaction.Draw({
      source: this.source,
      type: "Polygon"
    });

    this.tekenPolygoonInteraction.on("drawend", drawevent => {
      this.polygonGetekend.emit(drawevent.feature);
    });

    this.kaart.map.addInteraction(this.tekenPolygoonInteraction);

    if (this.feature) {
      this.vectorLaag.getSource().addFeature(this.feature);
    }

    this.vectorLaag.setZIndex(100);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    this.kaart.map.removeInteraction(this.tekenPolygoonInteraction);
    this.vectorLaag
      .getSource()
      .getFeatures()
      .forEach(feat => this.vectorLaag.getSource().removeFeature(feat));
  }
}
