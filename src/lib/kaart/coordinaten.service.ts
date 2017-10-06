import * as ol from "openlayers";

@Injectable()
export class CoordinatenService {
  /**
   * Zet WGS 84 om naar Lambert 72
   *
   * @param coordinaat wgs84 coordinaat
   * @returns Lambert 72 coordinaat
   */
  transformWgs84(coordinaat: ol.Coordinate): ol.Coordinate {
    return this.transform(coordinaat, "EPSG:4326", "EPSG:31370");
  }

  /**
   * Zet coordinaat om
   *
   * @param {ol.Coordinate} coordinaat
   * @param {string} source
   * @param {string} destination
   * @returns {ol.Coordinate}
   */
  transform(coordinaat: ol.Coordinate, source: string, destination: string): ol.Coordinate {
    return ol.proj.transform(coordinaat, source, destination);
  }
}
