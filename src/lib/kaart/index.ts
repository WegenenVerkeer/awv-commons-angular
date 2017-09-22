import {ModuleWithProviders, NgModule} from "@angular/core";
import {KaartComponent} from "./kaart.component";
import {CommonModule} from "@angular/common";
import {LocatieZoekerComponent} from "./locatie-zoeker.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {InputClearComponent} from "./input-clear.component";
import {LocatieZoeker} from "./locatie-zoeker.service";
import {KaartConfig} from "./kaart.config";
import {HttpModule} from "@angular/http"; // TODO port naar HttpClientModule

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpModule],
  declarations: [KaartComponent, LocatieZoekerComponent, InputClearComponent],
  exports: [KaartComponent, LocatieZoekerComponent],
  providers: [LocatieZoeker]
})
export class KaartModule {
  static forRoot(config: KaartConfig): ModuleWithProviders {
    return {
      ngModule: KaartModule,
      providers: [{provide: KaartConfig, useValue: config}]
    };
  }
}
