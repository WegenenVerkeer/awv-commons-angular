import {Injectable} from "@angular/core";
import {Http, URLSearchParams, Response, QueryEncoder} from "@angular/http"; // TODO port naar nieuwe httpclient
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeAll";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/catch";

import * as ol from "openlayers";
import {} from "googlemaps";
import {GoogleLocatieZoekerConfig} from "./google-locatie-zoeker.config";

const googleApiKey = "AIzaSyApbXMl5DGL60g17JU6MazMxNcUGooey7I";
const googleUrl = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places&language=nl&callback=__onGoogleLoaded`;

// Deze URL encoder gaat alles encoden. De standaard encoder encode volgende characters NIET:
// ! $ \' ( ) * + , ; A 9 - . _ ~ ? /     (zie https://tools.ietf.org/html/rfc3986)
// Maar de locatiezoeker backend verwacht die wel encoded.
class EncodeAllesQueryEncoder extends QueryEncoder {
  encodeKey(k: string): string {
    return encodeURIComponent(k);
  }

  encodeValue(v: string): string {
    return encodeURIComponent(v);
  }
}

class GoogleServices {
  geocoder: google.maps.Geocoder;
  autocompleteService: google.maps.places.AutocompleteService;
  placesService: google.maps.places.PlacesService;
  boundsVlaanderen: google.maps.LatLngBounds;

  constructor() {
    this.geocoder = new google.maps.Geocoder();
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.placesService = new google.maps.places.PlacesService(document.createElement("div"));
    this.boundsVlaanderen = new google.maps.LatLngBounds(
      new google.maps.LatLng(50.67267431841986, 2.501150609710172),
      new google.maps.LatLng(51.51349525865437, 6.243524925777398)
    );
  }
}

interface ExtendedResult {
  omschrijving: string;
  bron: string;
}

interface ExtendedGeocoderResult extends google.maps.GeocoderResult, ExtendedResult {}

interface ExtendedPlaceResult extends google.maps.places.PlaceResult, ExtendedResult {
  locatie: any;
}

export class ZoekResultaat {
  partialMatch: boolean;
  index: number;
  omschrijving: string;
  bron: string;
  geometry: any;
  locatie: any;
  selected = false;

  constructor(locatie, index: number) {
    this.partialMatch = locatie.partialMatch;
    this.index = index + 1;
    this.locatie = locatie.locatie;
    this.geometry = new ol.format.GeoJSON(<olx.format.GeoJSONOptions>{
      ignoreExtraDims: true,
      defaultDataProjection: null,
      featureProjection: null
    }).readGeometry(locatie.locatie);
    this.omschrijving = locatie.omschrijving;
    this.bron = locatie.bron;
  }
}

export class ZoekResultaten {
  resultaten: ZoekResultaat[] = [];
  fouten: string[] = [];

  constructor(error?: string) {
    if (error != null) {
      this.fouten.push(error);
    }
  }
}

@Injectable()
export class GoogleLocatieZoekerService {
  private _cache: Promise<GoogleServices> = null;
  locatieZoekerUrl = this.googleLocatieZoekerConfig.url;

  constructor(private http: Http, private googleLocatieZoekerConfig: GoogleLocatieZoekerConfig) {}

  private init(): Promise<GoogleServices> {
    if (this._cache) {
      // De data is al gecached.
      return this._cache;
    } else {
      // Eerste keer, vraag de data op aan de backend.
      this._cache = new Promise<GoogleServices>((resolve, reject) => {
        window["__onGoogleLoaded"] = ev => {
          resolve(new GoogleServices());
        };
        this.loadScript();
      });
      return this._cache;
    }
  }

  zoek(zoekterm): Observable<ZoekResultaten> {
    if (zoekterm.trim().length === 0) {
      return Observable.of(new ZoekResultaten());
    }
    const params: URLSearchParams = new URLSearchParams("", new EncodeAllesQueryEncoder());
    params.set("query", zoekterm);
    params.set("legacy", "false");

    return this.http
      .get(this.locatieZoekerUrl + "/zoek", {search: params})
      .map(this.parseResult, this)
      .mergeAll()
      .catch(this.handleError);
  }

  parseResult(response: Response): Observable<ZoekResultaten> {
    const zoekResultaten = new ZoekResultaten();

    // parse result
    const resultaten = response.json();

    // voeg eventuele foutboodschappen toe
    resultaten.errors.forEach(error => zoekResultaten.fouten.push("Fout: " + error));

    // indien geen locaties gevonden, toon melding
    if (resultaten.locaties.length === 0 && resultaten.onvolledigeLocaties.length === 0) {
      zoekResultaten.fouten.push("Geen locaties gevonden");
      return Observable.of(zoekResultaten);
    } else {
      // lijst van promises van resultaten
      const promises = resultaten.onvolledigeLocaties.map(locatie => {
        // alleen geocoden
        if (locatie.alleenGeocoden === true) {
          // Promise[List[Geocoded]]
          return this.geocode(locatie.omschrijving).then(geocodeResults => {
            geocodeResults.forEach(geocoded => {
              geocoded.bron = "WDB/Google Geocode";
              geocoded.omschrijving = geocoded.formatted_address;
            });
            return geocodeResults;
          });
        } else {
          // Promise[List[Prediction]]
          const predictionsPromise: Promise<google.maps.places.QueryAutocompletePrediction[]> = this.getAutocompleteQueryPredictions(locatie.omschrijving).catch(err => {
            // als predictionPromise faalt
            if (err === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              zoekResultaten.fouten.push("Geen resultaten gevonden via Google Autocomplete");
            } else {
              zoekResultaten.fouten.push(`Zoekopdracht via Google Autocomplete API is mislukt voor: ${locatie.omschrijving}: ${err}`);
            }
            return [];
          });

          // Promise[List[PlaceDetails]]
          const placeDetailsPromises = predictionsPromise.then(predictions => {
            // List[Promise[PlaceDetails]]
            const geocodedPredictionPromises = predictions.map(prediction => {
              // return geocode(prediction.description)
              return this.getPlaceDetails(prediction.place_id).catch(err => {
                // als geocode mislukt
                zoekResultaten.fouten.push(`Google Place details ophalen is mislukt voor: ${prediction.description}: ${err}`);
                return undefined;
              });
            }, this);

            // sequencing list of promises into promise of list: Promise[List[GeocodedPrediction]]
            return geocodedPredictionPromises.reduce((acc, geocodeResultsPredictionPromise) => {
              // acc: Promise[List[]]
              // predictionPromise: Promise[GeocodedPrediction]
              return acc.then(vorigeResultaten => {
                return geocodeResultsPredictionPromise.then(geocodeResultsPrediction => {
                  if (geocodeResultsPrediction === undefined) {
                    // geocode was mislukt
                    return vorigeResultaten;
                  } else {
                    geocodeResultsPrediction.forEach(geocodedPrediction => {
                      if (geocodedPrediction.types.indexOf("political") > -1) {
                        geocodedPrediction.omschrijving = geocodedPrediction.formatted_address;
                      }
                      // geocodedPrediction.bron = 'Google Autocomplete/Geocode'
                    });
                    return vorigeResultaten.concat(geocodeResultsPrediction);
                  }
                });
              });
            }, Promise.resolve([]));
          });

          // Promise[List[GeocodedPlaces]]
          const placesSearchPromise: Promise<ExtendedPlaceResult[]> = this.getPlacesTextSearch(locatie.omschrijving).catch(err => {
            // als placesSearchPromise faalt
            if (err === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              zoekResultaten.fouten.push("Geen resultaten gevonden op Google Places.");
            } else {
              zoekResultaten.fouten.push("Zoekopdracht via Google Places is mislukt: " + err);
            }
            return [];
          });

          // Promise[ List[GeocodedPrediction] + List[GeocodedPlaces] ]
          return placeDetailsPromises.then(predictions => {
            return placesSearchPromise.then(places => {
              const alleResultaten = [];
              const besteResultaten = [];
              const establishments = [];
              const voegToe = nieuw => {
                const zitErAlIn =
                  alleResultaten.find(bestaande => {
                    return (
                      Math.abs(bestaande.geometry.location.lng() - nieuw.geometry.location.lng()) < 0.0001 &&
                      Math.abs(bestaande.geometry.location.lat() - nieuw.geometry.location.lat()) < 0.0001
                    );
                  }) !== undefined;
                if (!zitErAlIn) {
                  alleResultaten.push(nieuw);
                  if (nieuw.types.indexOf("establishment") > -1) {
                    establishments.push(nieuw);
                  } else {
                    besteResultaten.push(nieuw);
                  }
                }
              };

              places.forEach(voegToe);
              predictions.forEach(voegToe);

              // zoek gemeente geometrie op voor besteresultaten (niet voor establishments)

              // List[Promise[besteResultaten]]
              const besteResultatenMetGeometriePromises = besteResultaten.map(resultaat => {
                return this.loadGemeenteGeometrie(resultaat).catch(err => {
                  zoekResultaten.fouten.push(`Geometrie ophalen is mislukt voor: ${resultaat.name}: ${err}`);
                  return resultaat;
                });
              }, this);

              // Promise[List[besteResultaten]]
              const alleResultatenPromise2 = besteResultatenMetGeometriePromises.reduce((acc, resultaatPromise) => {
                return acc.then(vorigeResultaten => {
                  return resultaatPromise.then(resultaat => {
                    return vorigeResultaten.concat(resultaat);
                  });
                });
              }, Promise.resolve([]));

              // Promise[besteResultaten + establishments]
              return alleResultatenPromise2.then(besteResultatenMetGeometrie => {
                return besteResultatenMetGeometrie.concat(establishments);
              });
            });
          });
        }
      });

      // promise van lijst van resultaten
      const alleResultatenPromise = promises.reduce((acc, resultaatPromise) => {
        return acc.then(vorigeResultaten => {
          return resultaatPromise.then(resultaat => {
            return vorigeResultaten.concat(resultaat);
          });
        });
      }, Promise.resolve([]));

      const zoekResultatenPromise: Promise<ZoekResultaten> = alleResultatenPromise.then(resultatenLijst => {
        resultatenLijst.forEach(resultaat => {
          resultaat.locatie = resultaat.locatie || this.wgs84ToLambert72GeoJson(resultaat.geometry.location.lng(), resultaat.geometry.location.lat());
        });
        const locaties = resultaten.locaties.concat(resultatenLijst);
        if (locaties.length === 30) {
          zoekResultaten.fouten.push("Er werden meer dan 30 resultaten gevonden, de eerste 30 worden hier opgelijst");
        }
        locaties.forEach((locatie, index) => {
          zoekResultaten.resultaten.push(new ZoekResultaat(locatie, index));
        });
        return zoekResultaten;
      });

      return Observable.fromPromise(zoekResultatenPromise);
    }
  }

  handleError(response: Response | any): Observable<ZoekResultaten> {
    let error: string;
    switch (response.status) {
      case 404:
        error = "Locatiezoeker service werd niet gevonden";
        break;
      default:
        // toon http foutmelding indien geen 200 teruggehad
        error = `Fout bij opvragen locatie: ${response.responseText || response.statusText || response}`;
    }
    return Observable.of(new ZoekResultaten(error));
  }

  private geocode(omschrijving): Promise<ExtendedGeocoderResult[]> {
    return this.init().then(gapi => {
      return new Promise<ExtendedGeocoderResult[]>((resolve, reject) => {
        gapi.geocoder.geocode(
          {
            address: omschrijving
          },
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
              resolve(
                results.map(result => <ExtendedGeocoderResult>result).map(result => {
                  result.omschrijving = omschrijving;
                  return result;
                })
              );
            } else {
              reject(status);
            }
          }
        );
      });
    });
  }

  private getAutocompleteQueryPredictions(omschrijving): Promise<google.maps.places.QueryAutocompletePrediction[]> {
    return this.init().then(gapi => {
      return new Promise<google.maps.places.QueryAutocompletePrediction[]>((resolve, reject) => {
        gapi.autocompleteService.getQueryPredictions(
          {
            input: omschrijving + ", Belgie",
            bounds: gapi.boundsVlaanderen
          },
          (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              resolve(predictions.filter(prediction => prediction.description.indexOf("in de buurt van") === -1));
            } else {
              reject(status);
            }
          }
        );
      });
    });
  }

  private getPlacesTextSearch(omschrijving): Promise<ExtendedPlaceResult[]> {
    return this.init().then(gapi => {
      return new Promise<ExtendedPlaceResult[]>((resolve, reject) => {
        gapi.placesService.textSearch(
          {
            query: omschrijving + ", Belgie",
            bounds: gapi.boundsVlaanderen,
            type: "address"
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              resolve(
                results
                  .map(result => <ExtendedPlaceResult>result)
                  .map(result => {
                    if (result.formatted_address.indexOf(result.name) > -1) {
                      result.omschrijving = result.formatted_address;
                    } else {
                      result.omschrijving = `${result.name}, ${result.formatted_address}`;
                    }
                    result.bron = "Google Places";
                    return result;
                  })
                  .filter(result => gapi.boundsVlaanderen.contains(result.geometry.location))
              );
            } else {
              reject(status);
            }
          }
        );
      });
    });
  }

  private getPlaceDetails(placeId): Promise<ExtendedPlaceResult[]> {
    return this.init().then(gapi => {
      return new Promise<ExtendedPlaceResult[]>(function(resolve, reject) {
        gapi.placesService.getDetails(
          {
            placeId: placeId
          },
          (result, status) => {
            const place = <ExtendedPlaceResult>result;
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              if (place.formatted_address.indexOf(place.name) > -1) {
                place.omschrijving = place.formatted_address;
              } else {
                place.omschrijving = `${place.name}, ${place.formatted_address}`;
              }
              place.bron = "Google Autocomplete";
              if (gapi.boundsVlaanderen.contains(place.geometry.location)) {
                resolve([place]);
              } else {
                resolve([]);
              }
            } else {
              reject(status);
            }
          }
        );
      });
    });
  }

  private loadGemeenteGeometrie(resultaat: ExtendedPlaceResult): Promise<ExtendedPlaceResult> {
    const isGemeente = resultaat.types.indexOf("locality") > -1;
    const isDeelgemeente = resultaat.types.indexOf("sublocality") > -1;

    if (isGemeente || isDeelgemeente) {
      let gemeenteNaam =
        resultaat.address_components == null
          ? null
          : resultaat.address_components.filter(address_component => address_component.types.indexOf("locality") > -1).map(address_component => address_component.short_name)[0];
      gemeenteNaam = gemeenteNaam || resultaat.name;

      const url =
        `${this.locatieZoekerUrl}/gemeente?naam=${gemeenteNaam}&latLng=${resultaat.geometry.location.lat()},${resultaat.geometry.location.lng()}` +
        `&isGemeente=${isGemeente}&isDeelgemeente=${isDeelgemeente}`;

      return this.http
        .get(url)
        .map(res => {
          resultaat.locatie = res.json();
          return resultaat;
        })
        .toPromise();
    } else {
      return Observable.of(resultaat).toPromise();
    }
  }

  private wgs84ToLambert72GeoJson(lon, lat) {
    const mercatorlonlat = ol.proj.transform([lon, lat], "EPSG:4326", "EPSG:31370");
    const writer = new ol.format.GeoJSON();
    return JSON.parse(writer.writeGeometry(new ol.geom.Point(mercatorlonlat)));
  }

  private loadScript() {
    const node = document.createElement("script");
    node.src = googleUrl;
    node.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(node);
  }
}
