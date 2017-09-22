import {AfterViewChecked, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {isNullOrUndefined} from "util";

import * as ol from "openlayers";
import * as uuid from "uuid";
import * as proj4 from "proj4";
import {KaartConfig} from "./kaart.config";
import LayerSwitcher from "ol3-layerswitcher/src/ol3-layerswitcher";

export abstract class LayerConfig<T> {
  abstract laagNaam: string;
  abstract style: ol.style.Style;

  abstract maakFeature(item: T): ol.Feature;
}

export class VectorLayer {
  source: ol.source.Vector;
  selection: ol.Collection<ol.Feature>;
}

class InternalVectorLayer extends VectorLayer {
  layer: ol.layer.Vector;
}

export interface VectorLayersMap {
  [name: string]: VectorLayer;
}

class CenterEnZoom {
  constructor(readonly center: [number, number], readonly zoom: number) {}
}

export enum DrawType {
  Routering,
  ClickPick
}

@Component({
  selector: "awv-kaart",
  templateUrl: "./kaart.template.html",
  styleUrls: ["kaart.scss"]
})
export class KaartComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild("map") mapElement: ElementRef;

  @ViewChild("locatieZoeker") locatieZoekerElement: ElementRef;

  @ViewChild("knoppen") knoppenElement: ElementRef;

  @Output() featuresGeselecteerd: EventEmitter<string> = new EventEmitter<string>();

  featureClick: EventEmitter<ol.Feature> = new EventEmitter<ol.Feature>();

  polygonDrawn: EventEmitter<ol.Feature> = new EventEmitter<ol.Feature>();

  @Input() maxZoom = 13;

  @Input() minZoom = 2;

  @Input() initialZoom = 2;

  @Input() centerCoordinates: Array<number> = [130000, 184000];

  @Input() width: number;

  @Input() height = 100;

  @Input() parent: ElementRef = null;

  actualHeight: number = this.height;

  @Input() viewOnly = false;

  private resolveMap: (map: ol.Map) => void;

  layers: Map<string, VectorLayer> = new Map<string, VectorLayer>();

  map: Promise<ol.Map> = new Promise<ol.Map>((resolve, reject) => (this.resolveMap = resolve));

  mapElementId: String = "map_" + uuid.v4();

  controls: ol.Collection<ol.control.Control>;

  interactions: ol.Collection<ol.interaction.Interaction>;

  vectorLayersGroup: ol.layer.Group = new ol.layer.Group({
    visible: true
  });

  vectorLayers: VectorLayersMap = {};

  referentieLagen: ol.layer.Group;

  dienstkaartProjectie: ol.proj.Projection;

  routeringModifyInteraction: ol.interaction.Modify = null;

  routeringSelectInteraction: ol.interaction.Select = null;

  routeringDrawInteraction: ol.interaction.Modify = null;

  routeringHoverInteraction: ol.interaction.Modify = null;

  private tekenPolygoonInteraction: ol.interaction.Draw = null;

  private selecteerFeatureInteraction: ol.interaction.Select = null;

  waypointsLayer: ol.layer.Vector;

  routesLayer: ol.layer.Vector;

  routingActief = false;

  private previousSize: ClientRect;

  /** Deze events geven aan dat de kaart open gegaan is (in bv. accordeon) **/
  private mapOpenedEvents = new EventEmitter<ClientRect>();

  private savedCenterEnZoom: CenterEnZoom;

  private teZettenExtent: ol.geom.SimpleGeometry | [number, number, number, number] = null;
  private polygoonLayer: ol.layer.Vector;

  constructor(private kaartConfig: KaartConfig) {
    this.initialiseerLambert72();
    this.initialiseerReferentieLagen();
  }

  initialiseerLambert72() {
    // OL3 heeft enkel support voor "EPSG:4326" en "EPSG:3857", configureer hier lambert72
    ol.proj.setProj4(proj4);
    proj4.defs(
      "EPSG:31370",
      "+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 " +
        "+ellps=intl +towgs84=-125.8,79.9,-100.5 +units=m +no_defs"
    );

    this.dienstkaartProjectie = ol.proj.get("EPSG:31370");
    this.dienstkaartProjectie.setExtent([18000.0, 152999.75, 280144.0, 415143.75]); // zet de extent op die van de dienstkaart
  }

  private createLocatieZoekerControl() {
    const element = document.createElement("div");
    element.className = "ol-control locatiezoeker";
    element.style.top = "0";
    element.style.right = "0";
    element.style.padding = "0 0 5px 5px";
    element.appendChild(this.locatieZoekerElement.nativeElement);

    return new ol.control.Control({element: element});
  }

  private createKnoppenControls() {
    const element = document.createElement("div");
    element.className = "ol-control knoppen";
    element.style.bottom = "30px";
    element.style.left = "10px";
    element.style.margin = "0px";
    element.style.padding = "0px";
    element.appendChild(this.knoppenElement.nativeElement);

    return new ol.control.Control({element: element});
  }

  private getControls(): ol.Collection<ol.control.Control> {
    if (this.viewOnly) {
      return new ol.Collection<ol.control.Control>();
    } else {
      return ol.control
        .defaults()
        .extend([
          new ol.control.ScaleLine(),
          new ol.control.ZoomSlider(),
          this.createLocatieZoekerControl(),
          this.createKnoppenControls(),
          new ol.control.FullScreen({
            className: "full-screen-control-left",
            source: this.parent ? this.parent : this.mapElement.nativeElement.parentElement
          }),
          new LayerSwitcher({
            tipLabel: "Lagen"
          })
        ])
        .extend(this.getExtraControls().getArray());
    }
  }

  protected getExtraControls(): ol.Collection<ol.control.Control> {
    return new ol.Collection<ol.control.Control>();
  }

  private getInteractions() {
    if (this.viewOnly) {
      return [];
    } else {
      return ol.interaction.defaults();
    }
  }

  private setCursor(cursor: string) {
    this.map.then(map => ((<HTMLElement>map.getViewport()).style.cursor = cursor));
  }

  getCursor(map: ol.Map) {
    return (<HTMLElement>map.getViewport()).style.cursor;
  }

  getLayer(laagNaam: string) {
    return this.layers.get(laagNaam);
  }

  selecteerFeature(laagNaam: string, featureId: string) {
    this.selecteerFeatures(laagNaam, [featureId]);
  }

  selecteerFeatures(laagNaam: string, featureIds: string[]) {
    const layer = this.getLayer(laagNaam);

    layer.selection.clear();

    if (featureIds != null) {
      featureIds.forEach(featureId => {
        if (featureId != null) {
          const feature = layer.source.getFeatureById(featureId);
          if (feature != null) {
            layer.selection.push(feature);
          }
        }
      });
    }
  }

  toonFeatures<T>(items: T[], layerConfig: LayerConfig<T>, group: ol.layer.Group = this.vectorLayersGroup, visible = true, zoomToExtent = true) {
    let laag = this.layers.get(layerConfig.laagNaam);
    if (laag == null) {
      laag = this.maakVectorLaagAan(layerConfig.laagNaam, layerConfig.style, group, visible);
      this.layers = this.layers.set(layerConfig.laagNaam, laag);
    } else {
      laag.selection.clear();
      laag.source.clear();
    }

    let extent: ol.geom.SimpleGeometry | [number, number, number, number] = [18000, 152999, 280143, 246528]; // Vlaanderen

    if (items && items.length > 0) {
      items.map(item => layerConfig.maakFeature(item)).forEach(feature => laag.source.addFeature(feature));

      extent = laag.source.getExtent();
    }

    if (zoomToExtent) {
      this.zoomTo(extent);
    }
  }

  maakVectorLaagAan(
    naam: string,
    style: ol.style.Style | ol.style.Style[] | ol.StyleFunction,
    group: ol.layer.Group = this.vectorLayersGroup,
    visible = true,
    selectable = true
  ): VectorLayer {
    if (this.vectorLayers[naam] !== undefined) {
      return this.vectorLayers[naam];
    } else {
      const vectorLayer = new InternalVectorLayer();
      vectorLayer.source = new ol.source.Vector();
      vectorLayer.layer = new ol.layer.Vector(<olx.layer.VectorOptions>{
        title: naam,
        source: vectorLayer.source,
        style: style,
        visible: visible,
        selectable: selectable
      });
      this.map.then(map => group.getLayers().push(vectorLayer.layer));
      // ---- Voeg de select interactie toe
      vectorLayer.selection = new ol.Collection<ol.Feature>();
      const selecteerFeatureInteraction = new ol.interaction.Select({
        features: vectorLayer.selection,
        layers: function(layer) {
          return layer.get("selectable") === true;
        },
        condition: ol.events.condition.singleClick
      });

      this.map.then(map => {
        map.addInteraction(selecteerFeatureInteraction);
      });

      selecteerFeatureInteraction.on("select", evt => {
        if (evt.selected.length > 0) {
          this.featureClick.emit(evt.selected[0]);
        }
      });

      // ---- Voeg de hover interactie toe
      const vectorHoverInteraction = new ol.interaction.Select({
        layers: [vectorLayer.layer],
        style: style,
        condition: ol.events.condition.pointerMove
      });
      this.map.then(map => {
        map.addInteraction(vectorHoverInteraction);
      });

      this.vectorLayers[naam] = vectorLayer;
      return vectorLayer;
    }
  }

  activeerTekenPolygoon(feat?) {
    const source = new ol.source.Vector({wrapX: false});
    this.polygoonLayer = new ol.layer.Vector(<olx.layer.VectorOptions>{
      title: "poly",
      source: source
    });

    this.tekenPolygoonInteraction = new ol.interaction.Draw({
      source: source,
      type: "Polygon"
    });
    this.map.then(map => {
      this.activeerSelectInteraction(false);

      if (feat) {
        this.polygoonLayer.getSource().addFeature(feat);
      }

      this.tekenPolygoonInteraction.on("drawend", drawevent => {
        this.polygonDrawn.emit(drawevent.feature);
      });
      map.addInteraction(this.tekenPolygoonInteraction);

      this.vectorLayersGroup.getLayers().push(this.polygoonLayer);
      this.polygoonLayer.setZIndex(100);
    });
  }

  private activeerSelectInteraction(active: boolean) {
    this.map.then(map => {
      map.getInteractions().forEach(function(interaction) {
        if (interaction instanceof ol.interaction.Select) {
          interaction.setActive(active);
        }
      });
    });
  }

  verwijderTekenPolygoon() {
    this.map.then(map => {
      this.deactiveerTekenPolygoon();
      this.polygoonLayer
        .getSource()
        .getFeatures()
        .forEach(feat => this.polygoonLayer.getSource().removeFeature(feat));
      this.vectorLayersGroup.getLayers().remove(this.polygoonLayer);
    });
  }

  deactiveerTekenPolygoon() {
    this.map.then(map => {
      this.activeerSelectInteraction(true);
      map.removeInteraction(this.tekenPolygoonInteraction);
    });
  }

  ngOnInit() {
    // -- Als we dit niet doen, kloppen de coordinaten van de interacties niet (door de layouting),
    // --   dan moet je naast features klikken.
    setTimeout(() => this.maakKaart(), 500);
  }

  ngOnDestroy(): void {}

  private getCurrentMapDimensions() {
    return this.mapElement.nativeElement.getBoundingClientRect();
  }

  ngAfterViewChecked(): void {
    const previousSize = this.previousSize;
    const newSize = this.getCurrentMapDimensions();

    if (!previousSize || previousSize.width !== newSize.width || previousSize.height !== newSize.height) {
      this.previousSize = newSize;
      this.map.then(map => this.fixMapDimensions(map, previousSize, newSize));
    }
  }

  fixMapDimensions(map: ol.Map, previousSize: ClientRect, newSize: ClientRect) {
    // Fix voor geen kaart na collapse component
    // Fix voor offset mouse pointer op kaart bij collapse sidebar
    // Fix voor groter wordende kaart bij resize
    map.setSize([newSize.width, newSize.height]);

    if (newSize.height > 0) {
      this.actualHeight = newSize.height;

      if (!previousSize || previousSize.height === 0) {
        // Fire een mapOpenEvent als de hoogte van 0 (of niets) naar groter dan 0 gaat
        this.mapOpenedEvents.next(newSize);
      }
    }
  }

  private initialiseerReferentieLagen() {
    this.referentieLagen = new ol.layer.Group(<olx.layer.GroupOptions>{
      title: "Referentielagen",
      layers: [
        new ol.layer.Tile(<olx.layer.TileOptions>{
          title: "Orthofoto's (AGIV)",
          type: "base",
          visible: false,
          extent: [18000.0, 152999.75, 280144.0, 415143.75],
          source: new ol.source.TileWMS({
            projection: null,
            urls: this.kaartConfig.orthofotosWmsUrls,
            params: {
              LAYERS: "Ortho",
              TILED: true,
              SRS: "EPSG:31370"
            }
          })
        }),
        new ol.layer.Tile(<olx.layer.TileOptions>{
          title: "Dienstkaart kleur",
          type: "base",
          visible: false,
          extent: [18000.0, 152999.75, 280144.0, 415143.75],
          source: new ol.source.TileWMS({
            projection: null,
            urls: this.kaartConfig.dienstkaartKleurWmsUrls,
            params: {
              LAYERS: "dienstkaart-kleur",
              TILED: true,
              SRS: "EPSG:31370"
            }
          })
        }),
        new ol.layer.Tile(<olx.layer.TileOptions>{
          title: "Dienstkaart grijs",
          type: "base",
          visible: true,
          extent: [18000.0, 152999.75, 280144.0, 415143.75],
          source: new ol.source.TileWMS({
            projection: null,
            urls: this.kaartConfig.dienstkaartGrijsWmsUrls,
            params: {
              LAYERS: "dienstkaart-grijs",
              TILED: true,
              SRS: "EPSG:31370"
            }
          })
        }),
        new ol.layer.Tile(<olx.layer.TileOptions>{
          title: "Ident8 labels (WDB)",
          visible: false,
          extent: [18000.0, 152999.75, 280144.0, 415143.75],
          source: new ol.source.TileWMS({
            projection: null,
            urls: this.kaartConfig.ident8LabelsWdbWmsUrls,
            params: {
              LAYERS: "ident8",
              TILED: true,
              SRS: "EPSG:31370",
              VERSION: "1.1.1"
            }
          })
        }),
        new ol.layer.Tile(<olx.layer.TileOptions>{
          title: "Referentiepunten (WDB)",
          visible: false,
          extent: [18000.0, 152999.75, 280144.0, 415143.75],
          source: new ol.source.TileWMS({
            projection: null,
            urls: this.kaartConfig.referentiepuntenWdbWmsUrls,
            params: {
              LAYERS: "referentiepunten",
              TILED: true,
              SRS: "EPSG:31370",
              VERSION: "1.1.1"
            }
          })
        })
      ]
    });
  }

  maakKaart() {
    // ---- Maak de kaart aan
    const map = new ol.Map(<any>{
      controls: this.getControls(),
      interactions: this.getInteractions(),
      layers: [this.referentieLagen, this.vectorLayersGroup],
      pixelRatio: 1, // dit moet op 1 staan anders zal OL3 512x512 tiles ophalen op retina displays en die zitten niet in onze geowebcache
      target: this.mapElementId,
      logo: false,
      view: new ol.View({
        projection: this.dienstkaartProjectie,
        center: [this.centerCoordinates[0], this.centerCoordinates[1]],
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        zoom: this.initialZoom
      })
    });

    this.resolveMap(map);
  }

  saveCenterEnZoom() {
    this.map.then(map => (this.savedCenterEnZoom = new CenterEnZoom(map.getView().getCenter(), map.getView().getZoom())));
  }

  hasSavedCenterEnZoom(): boolean {
    return !isNullOrUndefined(this.savedCenterEnZoom);
  }

  loadCenterEnZoom() {
    if (this.savedCenterEnZoom) {
      this.map.then(map => {
        map.getView().setCenter(this.savedCenterEnZoom.center);
        map.getView().setZoom(this.savedCenterEnZoom.zoom);
      });
    }
  }

  zoomTo(extent: ol.geom.SimpleGeometry | [number, number, number, number]): void {
    // bewaar de laatst gevraagde extent om te verhinderen dat defer in een verkeerde volgorde de extent zet
    this.teZettenExtent = extent;
    // we moeten deze actie uitstellen tot de kaart open is (in accordeon), anders wordt de zoom niet goed gedaan
    this.deferActionUntilMapOpen(() =>
      this.map.then(map => {
        map.getView().fit(this.teZettenExtent, {size: map.getSize()});
      })
    );
  }

  deferActionUntilMapOpen(action: () => void) {
    if (this.getCurrentMapDimensions().height > 0) {
      action();
    } else {
      this.mapOpenedEvents
        .asObservable()
        .take(1)
        .subscribe(action);
    }
  }

  setScrollToZoom(active: boolean): void {
    this.map.then(map => {
      map.getInteractions().forEach(function(interaction) {
        if (interaction instanceof ol.interaction.MouseWheelZoom) {
          interaction.setActive(active);
        }
      });
    });
  }
}
