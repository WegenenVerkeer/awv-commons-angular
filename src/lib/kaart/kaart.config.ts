import {Injectable} from "@angular/core";

@Injectable()
export class KaartConfig {
  orthofotosWmsUrls: string[];
  dienstkaartKleurWmsUrls: string[];
  dienstkaartGrijsWmsUrls: string[];
  ident8LabelsWdbWmsUrls: string[];
  referentiepuntenWdbWmsUrls: string[];
}
