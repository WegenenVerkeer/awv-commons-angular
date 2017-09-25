import {Component, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {KaartComponent} from "./kaart.component";
import {KaartToonFeaturesComponent} from "./kaart-toon-features.component";

import * as ol from "openlayers";

@Component({
  selector: "awv-kaart-toon-icon-op-lengte-breedtegraad",
  template: "&nbsp;"
})
export class KaartToonIconOpLengteBreedtegraadComponent extends KaartToonFeaturesComponent implements OnInit, OnDestroy {
  latLongFeature: ol.Feature;

  @Input() lengtegraad: number;
  @Input() breedtegraad: number;
  @Input() pinStyle: ol.style.Style;
  @Input() zoom = false;

  constructor(protected kaart: KaartComponent) {
    super(kaart);
  }

  ngOnInit(): void {
    this.latLongFeature = this.toFeature();
    this.features.push(this.toFeature());

    super.ngOnInit();

    if (this.zoom) {
      this.kaart.zoomTo(this.latLongFeature.getGeometry().getExtent());
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    this.features.splice(this.features.indexOf(this.latLongFeature));
  }

  toFeature(): ol.Feature {
    if (!this.lengtegraad) {
      throw new Error("Lengtegraad is verplicht");
    }

    if (!this.breedtegraad) {
      throw new Error("Breedtegraad is verplicht");
    }

    if (!this.pinStyle) {
      throw new Error("Pin style is verplicht");
    }

    const feature = new ol.Feature(new ol.geom.Point(ol.proj.transform([Number(this.lengtegraad), Number(this.breedtegraad)], "EPSG:4326", "EPSG:31370")));

    feature.setStyle(this.pinStyle);
    return feature;
  }
}
