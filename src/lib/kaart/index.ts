import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {KaartComponent} from "./kaart.component";
import {KaartKnoppenComponent} from "./kaart-knoppen.component";
import {KaartWmsLaagComponent} from "./kaart-wms-laag.component";
import {KaartVectorLaagComponent} from "./kaart-vector-laag.component";
import {KaartLayerSwitcherKnopComponent} from "./kaart-layer-switcher-knop.component";
import {KaartTekenPolygoonLaagComponent} from "./kaart-teken-polygoon-laag.component";
import {KaartLocatieZoekerComponent} from "./kaart-locatie-zoeker.component";

@NgModule({
  imports: [CommonModule],
  declarations: [
    KaartComponent,
    KaartWmsLaagComponent,
    KaartVectorLaagComponent,
    KaartKnoppenComponent,
    KaartLayerSwitcherKnopComponent,
    KaartTekenPolygoonLaagComponent,
    KaartLocatieZoekerComponent
  ],
  exports: [
    KaartComponent,
    KaartWmsLaagComponent,
    KaartVectorLaagComponent,
    KaartKnoppenComponent,
    KaartLayerSwitcherKnopComponent,
    KaartTekenPolygoonLaagComponent,
    KaartLocatieZoekerComponent
  ]
})
export class KaartModule {}

export * from "./kaart.component";
export * from "./kaart-wms-laag.component";
export * from "./kaart-vector-laag.component";
export * from "./kaart-knoppen.component";
export * from "./kaart-layer-switcher-knop.component";
export * from "./kaart-teken-polygoon-laag.component";
export * from "./kaart-locatie-zoeker.component";
