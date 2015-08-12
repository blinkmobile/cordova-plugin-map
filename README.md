# cordova-plugin-map

This plugin defines a Window.Map object, which supplies an interface to launch a map picker, allowing the user to confirm location information.

## Installation

- Install the plugin using the cordova CLI
```
cordova plugin add cordova-plugin-map
```

- Install the [Bing Maps SDK for Visual Studio 2015, 2013](https://visualstudiogallery.msdn.microsoft.com/224eb93a-ebc4-46ba-9be7-90ee777ad9e1).

- Add a reference to the Bing Maps for Javascript in Visual Studio
  - Select CordovaApp.Windows (Windows 8.1) in "Solution Explorer"
  - Project > Add Reference > Tick "Bing Maps for Javascript"

## Initialization

Initialization of the Map plugin object can happen in any function which is called after the device is ready.

following options must be provided by the user, either using `setOptions()` or `Map.confirmLocation(onSuccess, onError, options)` &gt; `options`

- latitude (mandatory)
- longitude (mandatory)
- bingMapKey (mandatory)

## Map.setOptions

Map.setOptions will set the options globally so user don't have to provide the `options` everytime during `Map.confirmLocation` call

```javascript
navigator.map.setOptions(onSuccess, onError, options);
```
The Options are:
- latitude
- longitude
- bingMapKey
- scale

## Map.confirmLocation

Map.confirmLocation will display a dialog which will draw a bing map based on input options. This allows the user to correct the geolocation information.

```javascript
navigator.map.confirmLocation(onSuccess, onError, options);
```
A pin is displayed based upon the supplied `latitude`/`longitude` options, then allow user to drag the pin around and confirm the final location or dismiss the map without any correction. The available options include:

- latitude (mandatory)
- longitude (mandatory)
- bingMapKey (mandatory)
- scale (optional)

Latitude is the GPS latitude data, plugin will return error if it is not supplied.

Longitude is the GPS longitude data, plugin will return error if it is not supplied.

The bingMapKey is a mandatory and important input option. All apps which call the bing map API need a unique key which is free for basic use. You can apply from bing map develop portal: https://www.microsoft.com/maps/create-a-bing-maps-key.aspx
In most cases, the free basic key is sufficient for general use. But before you apply for a bing map key, you will need a Microsoft account first (also free).

Scale is optional, the default scale is 17, the range of scale is 1 to 20, out of range values are clamped.

When the user presses "done", the location of the pin is returned as an object, e.g.:

```javascript
{ latitude: -33.4272, longitude: 151.3428 }
```

If the user presses "cancel", the result is `null`.

## Map.getStaticMap

Map.getStaticMap will generate a static map using the specified center point or the list of pushpins. It will pass a data url
to the success callback if a static map was able to be generated.

```javascript
navigator.map.getStaticMap(onSuccess, onError, options);
```

This method adds partial support for generating a static map using the [Bing Maps REST API for static maps](https://msdn.microsoft.com/en-us/library/ff701724.aspx). (HTTP GET methods only).
Supported options include:

- imagerySet
- centerPoint
- zoomLevel
- pushpins
- declutterPins
- mapSize
- format
- bingMapKey

At least one of the centerPoint and pushpins options must be supplied. If a list of pushpins is being supplied, the elements of the list must conform to the [Bing Maps pushpin syntax](https://msdn.microsoft.com/en-us/library/ff701719.aspx)


## Supported Platforms

Windows 8.1 +

## Example 1

Create a button on your page

```html
<button id="cordova-plugin-map-open">Location</button>
```

Then add click event

```javascript
navigator.map.setOptions(null, null, {"bingMapKey":"BING_MAP_KEY"});

document.getElementById("cordova-plugin-map-open").addEventListener("click", confirmLocation, false);

function confirmLocation(){
  navigator.map.confirmLocation(getLocation, onFail, {latitude:-33.4272, longitude:151.3428});
}

function getLocation(location) {
    if(!location) {
      console.warn("PLUGIN:MAP: User cancelled dialog!");
    } else {
      console.log("PLUGIN:MAP: latitude: " + location.latitude + ", longitude: " + location.longitude);
    }
}

function onFail(message) {
    console.error('PLUGIN:MAP: ' + message);
}

```

## Example 2

Generate a static map centered at latitude -33.42954484996579 and longitude 151.3395439980004 and
add a pushpin to that location.

```javascript
navigator.map.getStaticMap(success, error, {
  "pushpins": [[-33.42954484996579, 151.3395439980004, 37, "Gosford City Park"]],
  "centerPoint":[-33.42954484996579, 151.3395439980004],
  "zoomLevel": 18,
  "mapSize": [800, 800],
  "imagerySet": "AerialWithLabels"
});
```
