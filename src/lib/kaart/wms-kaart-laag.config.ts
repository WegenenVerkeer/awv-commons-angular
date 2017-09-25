import {KaartLaagConfig} from "./kaart-laag.config";

export class WmsKaartLaagConfig extends KaartLaagConfig {
  urls: string[];
  layers: string;
  tiled: boolean;
  srs: string;
  version?: string;
  type = "WMS";
}
