import {ModuleWithProviders, NgModule} from "@angular/core";
import {KaartComponent} from "./kaart.component";
import {CommonModule} from "@angular/common";
import {LocatieZoekerComponent} from "./locatie-zoeker.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputClearComponent} from "./input-clear.component";
import {LocatieZoeker} from "./locatie-zoeker.service";
import {HttpModule} from "@angular/http";
import {WmsKaartLaagComponent} from "./wms-kaart-laag.component"; // TODO port naar HttpClientModule

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpModule],
  declarations: [KaartComponent, LocatieZoekerComponent, InputClearComponent, WmsKaartLaagComponent],
  exports: [KaartComponent, WmsKaartLaagComponent, LocatieZoekerComponent],
  providers: [LocatieZoeker]
})
export class KaartModule {
  /*static forRoot(config: KaartConfig): ModuleWithProviders {
    return {
      ngModule: KaartModule,
      providers: [{provide: KaartConfig, useValue: config}]
    };
  }*/
}

export * from "./kaart.component";
export * from "./wms-kaart-laag.component";
export * from "./wms-kaart-laag.config";
export * from "./locatie-zoeker.component";
export * from "./input-clear.component";
export * from "./locatie-zoeker.service";
