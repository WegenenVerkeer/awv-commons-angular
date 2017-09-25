import {Injectable} from "@angular/core";

@Injectable()
export class WmsKaartLaagConfig {
  urls: string[];
  layers: string;
  tiled: boolean;
  srs: string;
  version?: string;
}
