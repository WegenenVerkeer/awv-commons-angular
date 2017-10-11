import {Component, Input, NgZone, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {KaartComponent} from "./kaart.component";

import LayerSwitcher from "ol3-layerswitcher/src/ol3-layerswitcher";

@Component({
  selector: "awv-kaart-knop-laag-kiezer",
  template: "<ng-content></ng-content>",
  styleUrls: ["./../../../node_modules/ol3-layerswitcher/src/ol3-layerswitcher.css", "./kaart-knop-laag-kiezer.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class KaartKnopLaagKiezerComponent implements OnInit, OnDestroy {
  @Input() tipLabel = "Lagen";

  laagKiezer: LayerSwitcher;

  constructor(protected kaart: KaartComponent, private zone: NgZone) {}

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.laagKiezer = new LayerSwitcher({
        tipLabel: this.tipLabel,
        target: this.kaart.mapElement.nativeElement.querySelector(".ol-overlaycontainer-stopevent")
      });

      this.kaart.map.addControl(this.laagKiezer);
    });
  }

  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      this.kaart.map.removeControl(this.laagKiezer);
    });
  }
}
