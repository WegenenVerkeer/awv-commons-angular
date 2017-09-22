import {Component, Input} from "@angular/core";
import {AbstractControl} from "@angular/forms";

@Component({
  selector: "awv-input-clear",
  template: `
<button type="button" md-icon-button [hidden]="!control?.value" (click)="clear()" 
  style="position: absolute; top: 0; right: 30px">
  <div>&#x2a2f;</div>
</button>`
})
export class InputClearComponent {
  @Input() control: AbstractControl;

  clear() {
    this.control.setValue("");
  }
}
