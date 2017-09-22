import {Component, Input} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {LocatieZoeker, ZoekResultaten, ZoekResultaat} from "./locatie-zoeker.service";
import {KaartComponent, VectorLayer} from "./kaart.component";

import * as ol from "openlayers";
import "rxjs/add/operator/debounce";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/switchMap";

@Component({
  selector: "awv-locatie-zoeker-resultaat",
  templateUrl: "./locatie-zoeker.template.html",
  styleUrls: ["./locatie-zoeker.component.scss"]
})
export class LocatieZoekerComponent {
  zoekForm: FormGroup;
  zoekResultaat: ZoekResultaten = null;

  @Input() kaart: KaartComponent;

  busy = false;
  toonHelp = false;

  private byPassDebounce: () => void;

  private _markers: VectorLayer = null;
  private _imageStyles: ol.style.Style[] = [];

  constructor(formBuilder: FormBuilder, private locatieZoeker: LocatieZoeker) {
    this.zoekForm = formBuilder.group({
      zoek: ""
    });
    this.zoekForm.valueChanges.debounce(() => {
        // Form changes worden debounced tot deze promise geresolved wordt.
        return new Promise(resolve => {
          // We houden de resolve functie pointer bij om de debounce te kunnen bypassen (bv. bij form submit).
          this.byPassDebounce = resolve;
          // We resolven hoe dan ook na een bepaalde timeout, zodat de taak bewaard wordt en de validatie uitgevoerd.
          setTimeout(resolve, 800);
        });
      })
      .distinctUntilChanged()
      .switchMap(form => this.zoek(form.zoek)) // switchMap om een unsubscribe te doen op de vorige request
      .subscribe(resultaat => this.processResultaat(resultaat));
  }

  zoekNu() {
    if (this.byPassDebounce) {
      this.byPassDebounce();
    }
  }

  zoek(omschrijving: string): Observable<ZoekResultaten> {
    this.busy = true;
    this.zoekResultaat = null;
    if (omschrijving !== "") {
      this.toonHelp = false;
    }
    return this.locatieZoeker.zoek(omschrijving);
  }

  private styleFunction(feature: ol.Feature | ol.render.Feature, resolution: number): ol.style.Style {
    const data: ZoekResultaat = feature.get("data");
    if (!this._imageStyles[data.index]) {
      this._imageStyles[data.index] = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "red",
          width: 1
        }),
        fill: new ol.style.Fill({
          color: [255, 0, 0, 0.2]
        }),
        image: new ol.style.Icon({
          src: this.image(data),
          anchor: [0.5, 1.0]
        })
      });
    }
    return this._imageStyles[data.index];
  }

  selectMarker(marker: ZoekResultaat) {
    this._markers.selection.clear();
    this._markers.selection.push(this._markers.source.getFeatureById(marker.index));
  }

  updateMarkerSelection(event) {
    event.element.get("data").selected = event.type === "add";
    if (this._markers.selection.getLength() > 0) {
      this.kaart.zoomTo(
        this._markers.selection
          .item(0)
          .getGeometry()
          .getExtent()
      );
    }
  }

  processResultaat(zoekResultaat: ZoekResultaten) {
    this.busy = false;
    this.zoekResultaat = zoekResultaat;
    if (this._markers == null) {
      this._markers = this.kaart.maakVectorLaagAan("Zoekresultaten", (feature, resolution) => this.styleFunction(feature, resolution));
      this._markers.selection.on("add", evt => this.updateMarkerSelection(evt));
      this._markers.selection.on("remove", evt => this.updateMarkerSelection(evt));
    }
    this._markers.source.clear();
    this._markers.selection.clear();
    zoekResultaat.resultaten.forEach(resultaat => {
      const feature = new ol.Feature({data: resultaat, geometry: resultaat.geometry, name: resultaat.omschrijving});
      feature.setId(resultaat.index);
      this._markers.source.addFeature(feature);
      let middlePoint = null;
      if (resultaat.locatie.type === "MultiLineString") {
        // voeg een puntelement toe ergens op de linestring om een icoon met nummer te tonen
        const lineStrings = resultaat.geometry.getLineStrings();
        const lineString = lineStrings[Math.floor(lineStrings.length / 2)];
        middlePoint = new ol.geom.Point(lineString.getCoordinateAt(0.5));
      } else if (resultaat.locatie.type === "Polygon" || resultaat.locatie.type === "MultiPolygon") {
        // in midden van gemeente polygon
        const extent = resultaat.geometry.getExtent();
        middlePoint = new ol.geom.Point([(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]);
      }
      if (middlePoint != null) {
        this._markers.source.addFeature(new ol.Feature({data: resultaat, geometry: middlePoint, name: resultaat.omschrijving}));
      }
    });
    if (this._markers.source.getFeatures().length !== 0) {
      this.kaart.zoomTo(this._markers.source.getExtent());
    }
  }

  image(resultaat?: ZoekResultaat, partial?: boolean, index?: number) {
    if (resultaat !== null) {
      partial = resultaat.partialMatch;
      index = resultaat.index;
    }
    return `assets/mapicons/${partial ? "partial/" : ""}number_${index}.png`;
  }
}
