# AWV commons angular

Angular componenten voor gebruik bij AWV.

## Hoe werkt het?

Dit project ambieert de implementatie van Angular Package Format v4.0.

Er is nog geen support voor een dergelijke packaging in Angular-CLI. We baseren ons op [https://github.com/filipesilva/angular-quickstart-lib]()

## Development

### Nieuwe component toevoegen

TODO

### Code testen

Deze component library is voorzien van een test Angular app.

    npm start
    
In `src\testApp` kan je je module toevoegen en op de pagina plaatsen om zo door te testen. 

Dit laat je ook toe om protractors te schrijven.

Tot slot vormt de source code van deze pagina de gebruiksaanwijzing van de componenten.

### Code style

De code style wordt automatisch afgedwongen via tslint + prettier. Deze is ingesteld dat de code wordt herschreven on commit, tenzij er brekende wijzigignen zijn (zoals foute typering en dergelijke meer).

## Publish

Elke succesvolle build wordt door Bamboo gepublished naar Nexus.

# Resources

* [Angular Package Format v4.0](https://goo.gl/AMOU5G)
* [NGConf 2017 presentatie](https://www.youtube.com/watch?v=unICbsPGFIA)

* [https://github.com/jasonaden/simple-ui-lib]()
* [https://github.com/filipesilva/angular-quickstart-lib]()

