(function () {
    'use strict';
    var config,
        callbacks,
        divId = "cordova-plugin-map-mapDiv",
        pinLocation,
        initCenter,
        map,
        html,
        popupHtml;


    config = {
        'latitude': null,
        'longitude': null,
        'scale': 17,
        'bingMapKey': null
    };

    callbacks = {
        'confirmOnSuccess': function () {
        },
        'confirmOnError': function () {
        },
        'confirmOptions': {}
    };

    html = '<link rel="stylesheet" href="css/cordova-plugin-map.css" />';

    popupHtml = '<div id="cordova-plugin-map-popup" class="cordova-plugin-map-nativePopUp cordova-plugin-map-layout-withOrientation"><div id="cordova-plugin-map-mapDiv" class="cordova-plugin-map-nativePopUp__content"></div><div class="cordova-plugin-map-nativePopUp__buttons cordova-plugin-map-layout-oppositeOrientation"><button data-action="done"  class="cordova-plugin-map-nativePopUp__button">done</button><button data-action="cancel" class="cordova-plugin-map-nativePopUp__button">cancel</button></div></div>';

    function appendVeapicoreJs() {
        var head = document.getElementsByTagName('head').item(0);
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', 'ms-appx:///Bing.Maps.JavaScript//js/veapicore.js');
        head.appendChild(script);
    }

    function execInjection(fun){
      if(MSApp.execUnsafeLocalFunction){
        MSApp.execUnsafeLocalFunction(fun);
      }else{
        fun();
      }
    }

    execInjection(function () {
          document.head.insertAdjacentHTML('beforeend', html);
          appendVeapicoreJs();
    });

    function openPopup() {
        execInjection(function () {
            document.body.insertAdjacentHTML('beforeend', popupHtml);
        });
        var popup = document.getElementById('cordova-plugin-map-popup');
        var done = popup.querySelector('button[data-action=done]');
        var cancel = popup.querySelector('button[data-action=cancel]');
        popup.classList.add('cordova-plugin-map-nativePopUp-open');
        window.addEventListener('resize', resizePopup, false);

        done.addEventListener('click', closePopup, false);
        cancel.addEventListener('click', cancelPopup, false);
    }

    function resizePopup() {
        deletePopup();
        confirmLocation(callbacks.confirmOnSuccess, callbacks.confirmOnError, callbacks.confirmOptions);
    }

    function closePopup() {
        callbacks.confirmOnSuccess({latitude: pinLocation.latitude, longitude: pinLocation.longitude});
        deletePopup();
    }

    function cancelPopup() {
        callbacks.confirmOnSuccess(null);
        deletePopup();
    }

    function deletePopup() {
        window.removeEventListener('resize', resizePopup, false);
        execInjection(function () {
            var popup = document.getElementById("cordova-plugin-map-popup");
            popup.classList.remove('cordova-plugin-map-nativePopUp-open');
            popup.parentNode.removeChild(popup);
        });
    }

    map = function (options) {};

    map.setOptions = function (onSuccess, onError, options) {
        Object.keys(config).forEach(function(k) {
            if (options[k]) {
                config[k] = options[k];
            }
        });
    };

    map.confirmLocation = function (onSuccess, onError, options) {
        var initMap;

        //check to see if latitude is provided
        if (options && options.latitude) {
            config.latitude = options.latitude;
        } else if(!config.latitude) {
            onError("latitude must be provided");
            return;
        }
        //check to see longitude is provided
        if (options && options.longitude) {
            config.longitude = options.longitude;
        } else if(!config.longitude) {
            onError("longitude must be provided");
            return;
        }
        //check to see bingMapKey is available
        if (options && options.bingMapKey) {
            config.bingMapKey = options.bingMapKey;
        } else if (!config.bingMapKey) {
            onError("map key must be provided");
            return;
        }

        if (options && options.scale) {
            config.scale = options.scale;
        }

        callbacks.confirmOnSuccess = onSuccess;
        callbacks.confirmOnError = onError;
        callbacks.confirmOptions = options;

        if (typeof Microsoft === 'undefined' || !Microsoft) {
            onError('bing maps API unavailable');
            return;
        }

        openPopup();

        initMap = function () {
            var bingMap, DisplayLoc;

            DisplayLoc = function (e) {
                if (e.targetType == 'pushpin') {
                    pinLocation = e.target.getLocation();
                }
            };

            if (!initCenter) {
                initCenter = new Microsoft.Maps.Location(config.latitude, config.longitude);
            }
            if (!pinLocation) {
                pinLocation = new Microsoft.Maps.Location(config.latitude, config.longitude);
            }

            var mapDiv = document.getElementById(divId);
            var rect = mapDiv.getBoundingClientRect();

            var mapOptions = {
                credentials: config.bingMapKey,
                center: pinLocation,
                zoom: config.scale,
                height: rect.height,
                width: rect.width
            };

            bingMap = new Microsoft.Maps.Map(mapDiv, mapOptions);

            // Add a pin to the center of the map
            var pin = new Microsoft.Maps.Pushpin(pinLocation, {draggable: true});

            // Add a handler to the pushpin drag
            Microsoft.Maps.Events.addHandler(pin, 'mouseup', DisplayLoc);

            bingMap.entities.push(pin);
        };

        Microsoft.Maps.loadModule('Microsoft.Maps.Map', {callback: initMap, culture: "en-us", homeRegion: "AU"});
    };

    // http://stackoverflow.com/a/9458996
    function arrayBufferToBase64(buffer) {
        var binary = "";
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        var i;

        for (i = 0; i < len; i += 1) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function buildStaticMapUrl(opts) {
        var url = "https://dev.virtualearth.net/REST/v1/Imagery/Map/";
        var i;

        url += opts.imagerySet;
        url += (opts.centerPoint) ? "/" + opts.centerPoint.toString() : "";
        url += (opts.zoomLevel) ? "/" + opts.zoomLevel : "";

        url += "?key=" + opts.bingMapKey;
        url += (opts.format) ? "&format=" + opts.format : "";

        if (opts.pushpins) {
            for (i = 0; i < opts.pushpins.length; i += 1) {
                url += "&pushpin=" + opts.pushpins[i].slice(0,2).toString();

                if (opts.pushpins[i][2]) {
                    url += ";" + opts.pushpins[i][2];
                    url += (opts.pushpins[i][3]) ? ";" + opts.pushpins[i][3] : "";
                } else if (opts.pushpins[i][3]) {
                    url += ";;" + opts.pushpins[i][3];
                }
            }
        }

        url += (opts.declutterPins) ? "&declutterPins=1" : "";
        url += (opts.mapSize) ? "&mapSize=" + opts.mapSize.toString() : "";

        return url;
    }

    map.getStaticMap = function (onSuccess, onError, options) {
        var isNonEmptyString = function (arg) {
            return ((typeof arg === "string" || arg instanceof String) && arg.length > 0);
        };

        if (!isNonEmptyString(options.bingMapKey)) {
            if (isNonEmptyString(config.bingMapKey)) {
                options.bingMapKey = config.bingMapKey
            } else {
                onError("map key not provided");
                return;
            }
        }

        WinJS.xhr({
            "url": buildStaticMapUrl(options),
            "responseType": "arraybuffer"
        }).done(
            function (request) {
                var base64;

                if (request.status === 200 && request.response) {
                    base64 = arrayBufferToBase64(request.response);
                    onSuccess("data:image/" +
                        ((options.format) ? options.format : "jpeg") +
                        ";base64," + base64);
                } else {
                    onError("failed to get static map. HTTP status: " + request.status);
                }
            },
            function (request) {
                onError("failed to get static map. HTTP status: " + request.status);
            });
    };
    navigator.map = map;

}());

cordova.commandProxy.add("MapPlugin", {
  setOptions: navigator.map.setOptions,
  confirmLocation: navigator.map.confirmLocation,
  getStaticMap: navigator.map.getStaticMap
});
