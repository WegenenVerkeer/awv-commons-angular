import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {KaartComponent} from "./kaart.component";

import LayerSwitcher from "ol3-layerswitcher/src/ol3-layerswitcher";

@Component({
  selector: "awv-kaart-layer-switcher-knop",
  template: "&nbsp;"
})
export class KaartLayerSwitcherKnopComponent implements OnInit, OnDestroy {
  layerSwitcher: LayerSwitcher;

  @Input() tipLabel = "Lagen";

  constructor(protected kaart: KaartComponent) {}

  ngOnInit(): void {
    this.layerSwitcher = new LayerSwitcher({
      tipLabel: this.tipLabel,
      target: this.kaart.knoppenElement.nativeElement
    });

    this.kaart.map.addControl(this.layerSwitcher);
  }

  ngOnDestroy(): void {
    this.kaart.map.removeControl(this.layerSwitcher);
  }
}
