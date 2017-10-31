import {Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation} from "@angular/core";
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

  constructor(protected kaart: KaartComponent, protected zone: NgZone) {
    super(kaart, zone);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.zone.runOutsideAngular(() => {
      this.renderFeatures(this.features);
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.zone.runOutsideAngular(() => {
      this.clear(this.features);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.vectorLaag) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      if ("features" in changes) {
        this.clear(changes.features.previousValue);
        this.renderFeatures(changes.features.currentValue);
      }
    });
  }

  private renderFeatures(features: ol.Collection<ol.Feature>) {
    this.vectorLaag.getSource().addFeatures(features.getArray());

    this.selecteerFeatureInteraction = new ol.interaction.Select({
      features: features,
      layers: layer => layer.get("selectable") === true,
      condition: ol.events.condition.singleClick
    });

    this.selecteerFeatureInteraction.on("select", event => {
      if (event.selected.length > 0) {
        this.zone.run(() => {
          this.featureGeselecteerd.emit(event.selected[0]);
        });
      }
    });

    this.kaart.map.addInteraction(this.selecteerFeatureInteraction);
  }

  private clear(features: ol.Collection<ol.Feature>) {
    if (features) {
      features.forEach(feature => this.vectorLaag.getSource().removeFeature(feature));
    }
    this.kaart.map.removeInteraction(this.selecteerFeatureInteraction);
  }
}
