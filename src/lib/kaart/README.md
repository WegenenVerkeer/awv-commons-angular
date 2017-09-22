# Kaart component

Angular kaart component.

## Gebruik

Include de volgende module in je app.module.ts:

    KaartModule.forRoot({
      orthofotosWmsUrls: ["http://geoservices.informatievlaanderen.be/raadpleegdiensten/omwrgbmrvl/wms"],
      dienstkaartKleurWmsUrls: [
        "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
      ],
      dienstkaartGrijsWmsUrls: [
        "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
      ],
      ident8LabelsWdbWmsUrls: [
        "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
      ],
      referentiepuntenWdbWmsUrls: [
        "https://wms1.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms2.apps.mow.vlaanderen.be/geowebcache/service/wms",
        "https://wms3.apps.mow.vlaanderen.be/geowebcache/service/wms"
      ]
    })
