import {Component, ViewChild} from "@angular/core";
import {KaartComponent} from "../lib/kaart/kaart.component";

@Component({
  selector: "awv-commons-test-app",
  templateUrl: "./app.component.html"
})
export class AppComponent {
  @ViewChild(KaartComponent) kaart: KaartComponent;
}
