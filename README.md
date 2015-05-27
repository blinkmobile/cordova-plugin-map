# cordova-plugin-map

This plugin defines a Window.Map object, which supplies an interface to launch a map picker, allowing the user to confirm location information.

## Installation

cordova plugin add cordova-plugin-map

## Initialization

Initialization of the Map plugin object can happen in any function which is called after the device is ready.

## Map.confirmLocation

Map.confirmLocation will display a dialog which will draw a bing map based on input options. This allows the user to correct the geolocation information.

```javascript
navigator.map.confirmLocation(onSuccess, onError, options);
```

## Description

A pin is displayed based upon the supplied `latitude`/`longitude` options, then allow user to drag the pin around and confirm the final location or dismiss the map without any correction. The available options include:

- latitude (mandatory)
- longitude (mandatory)
- map_key (mandatory)
- scale (optional)

Latitude is the GPS latitude data, plugin will return error if it is not supplied.

Longitude is the GPS longitude data, plugin will return error if it is not supplied.

The map_key is a mandatory and important input option. All apps which call the bing map API need a unique key which is free for basic use. You can apply from bing map develop portal: https://www.microsoft.com/maps/create-a-bing-maps-key.aspx
In most cases, the free basic key is sufficient for general use. But before you apply for a bing map key, you will need a Microsoft account first (also free).

Scale is optional, the default scale is 17, the range of scale is 1 to 20, out of range values are clamped.

When the user presses "done", the location of the pin is returned as an object, e.g.:

```javascript
{ latitude: -33.4272, longitude: 151.3428 }
```

If the user presses "cancel", the result is `null`.

## Supported Platforms

Windows 8.1 +

## Example

Create a button on your page

```html
<button id="cordova-plugin-map-open">Location</button>
```

Then add click event

```javascript
document.getElementById("cordova-plugin-map-open").addEventListener("click", confirmLocation, false);

function confirmLocation(){
  navigator.map.confirmLocation(getLocation, onFail, {latitude:-33.4272, longitude:151.3428,  bingMapKey:"AnnB69EpEvcSWECyb7esv5AGzKccK4Vt7m_Cxhk-QtYk-dZzs4HA139yfI5YXRxS"});
}

function getLocation(location){
  setTimeout(function() {
    if(!location)
      console.log("user canceled dialog");
    else
      console.log("plugin returned latitude: "+location.latitude+", longitude: "+location.longitude);
  }, 0);

}

function onFail(message) {
    setTimeout(function() {
      console.log('plugin message: ' + message);
    }, 0);
}
```
