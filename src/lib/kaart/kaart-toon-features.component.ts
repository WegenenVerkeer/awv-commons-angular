import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation} from "@angular/core";
import {KaartComponent} from "./kaart.component";
import {KaartVectorLaagComponent} from "./kaart-vector-laag.component";

import * as ol from "openlayers";

@Component({
  selector: "awv-kaart-toon-features",
  template: "<ng-content></ng-content>",
  encapsulation: ViewEncapsulation.None
})
export class KaartToonFeaturesComponent extends KaartVectorLaagComponent implements OnInit, OnDestroy, OnChanges {
  @Input() features = new ol.Collection<ol.Feature>();
  @Output() featureGeselecteerd: EventEmitter<ol.Feature> = new EventEmitter<ol.Feature>();

  selecteerFeatureInteraction: ol.interaction.Select;

  constructor(protected kaart: KaartComponent) {
    super(kaart);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.renderFeatures();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.clear();
  }

  private renderFeatures() {
    this.vectorLaag.getSource().addFeatures(this.features.getArray());

    this.selecteerFeatureInteraction = new ol.interaction.Select({
      features: this.features,
      layers: layer => layer.get("selectable") === true,
      condition: ol.events.condition.singleClick
    });

    this.selecteerFeatureInteraction.on("select", event => {
      if (event.selected.length > 0) {
        this.featureGeselecteerd.emit(event.selected[0]);
      }
    });

    this.kaart.map.addInteraction(this.selecteerFeatureInteraction);
  }

  private clear() {
    this.features.forEach(feature => this.vectorLaag.getSource().removeFeature(feature));
    this.kaart.map.removeInteraction(this.selecteerFeatureInteraction);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.vectorLaag) {
      return;
    }

    if ("features" in changes) {
      this.clear();
      this.renderFeatures();
    }
  }
}
