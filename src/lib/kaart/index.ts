import {NgModule} from "@angular/core";
import {KaartComponent} from "./kaart.component";
import {CommonModule} from "@angular/common";
import {LocatieZoekerComponent} from "./locatie-zoeker.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputClearComponent} from "./input-clear.component";
import {LocatieZoeker} from "./locatie-zoeker.service";
import {HttpModule} from "@angular/http";
import {KaartLaagComponent} from "./kaart-laag.component"; // TODO port naar HttpClientModule

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpModule],
  declarations: [KaartComponent, LocatieZoekerComponent, InputClearComponent, KaartLaagComponent],
  exports: [KaartComponent, KaartLaagComponent, LocatieZoekerComponent],
  providers: [LocatieZoeker]
})
export class KaartModule {}

export * from "./kaart.component";
export * from "./kaart-laag.component";
export * from "./kaart-laag.config";
export * from "./wms-kaart-laag.config";
export * from "./locatie-zoeker.component";
export * from "./input-clear.component";
export * from "./locatie-zoeker.service";
