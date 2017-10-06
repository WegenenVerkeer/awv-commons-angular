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
      this.renderFeatures();
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.zone.runOutsideAngular(() => {
      this.clear();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.vectorLaag) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      if ("features" in changes) {
        this.clear();
        this.renderFeatures();
      }
    });
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
        this.zone.run(() => {
          this.featureGeselecteerd.emit(event.selected[0]);
        });
      }
    });

    this.kaart.map.addInteraction(this.selecteerFeatureInteraction);
  }

  private clear() {
    if (!this.features) {
      return; // geen features gedefinieerd, er valt niks te clearen
    }

    this.features.getArray().forEach(feature => this.vectorLaag.getSource().removeFeature(feature));
    this.kaart.map.removeInteraction(this.selecteerFeatureInteraction);
  }
}
