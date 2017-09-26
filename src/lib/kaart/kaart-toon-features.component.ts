import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {KaartComponent} from "./kaart.component";
import {KaartVectorLaagComponent} from "./kaart-vector-laag.component";

import * as ol from "openlayers";

@Component({
  selector: "awv-kaart-toon-features",
  template: "&nbsp;"
})
export class KaartToonFeaturesComponent extends KaartVectorLaagComponent implements OnInit, OnDestroy {
  @Input() features = new ol.Collection<ol.Feature>();
  @Output() featureClick: EventEmitter<ol.Feature> = new EventEmitter<ol.Feature>();

  selecteerFeatureInteraction: ol.interaction.Select;

  constructor(protected kaart: KaartComponent) {
    super(kaart);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.vectorLaag.getSource().addFeatures(this.features.getArray());

    this.selecteerFeatureInteraction = new ol.interaction.Select({
      features: this.features,
      layers: layer => layer.get("selectable") === true,
      condition: ol.events.condition.singleClick
    });

    this.selecteerFeatureInteraction.on("select", event => {
      if (event.selected.length > 0) {
        this.featureClick.emit(event.selected[0]);
      }
    });

    this.kaart.map.addInteraction(this.selecteerFeatureInteraction);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    this.features.forEach(feature => this.vectorLaag.getSource().removeFeature(feature));
    this.kaart.map.removeInteraction(this.selecteerFeatureInteraction);
  }
}
