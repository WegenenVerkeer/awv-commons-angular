import {Component, OnDestroy, OnInit} from "@angular/core";

import * as ol from "openlayers";
import {KaartComponent} from "./kaart.component";

@Component({
  selector: "awv-kaart-knoppen",
  template: "&nbsp;"
})
export class KaartKnoppenComponent implements OnInit, OnDestroy {
  scaleLine: ol.control.ScaleLine;
  zoomSlider: ol.control.ZoomSlider;
  fullScreen: ol.control.FullScreen;

  constructor(protected kaart: KaartComponent) {}

  ngOnInit(): void {
    this.scaleLine = new ol.control.ScaleLine();
    this.zoomSlider = new ol.control.ZoomSlider();
    this.fullScreen = new ol.control.FullScreen({
      source: this.kaart.mapElement.nativeElement.parentElement
    });

    this.kaart.map.addControl(this.scaleLine);
    this.kaart.map.addControl(this.zoomSlider);
    this.kaart.map.addControl(this.fullScreen);
  }

  ngOnDestroy(): void {
    this.kaart.map.removeControl(this.scaleLine);
    this.kaart.map.removeControl(this.zoomSlider);
    this.kaart.map.removeControl(this.fullScreen);
  }
}
