import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {KaartComponent} from "./kaart.component";

import * as ol from "openlayers";
import {KaartVectorLaagComponent} from "./kaart-vector-laag.component";

@Component({
  selector: "awv-kaart-toon-features",
  template: "&nbsp;"
})
export class KaartToonFeaturesComponent extends KaartVectorLaagComponent implements OnInit, OnDestroy {
  @Input() features: ol.Feature[] = [];

  constructor(protected kaart: KaartComponent) {
    super(kaart);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.vectorLaag.getSource().addFeatures(this.features);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    this.features.forEach(feature => this.vectorLaag.getSource().removeFeature(feature));
  }
}
