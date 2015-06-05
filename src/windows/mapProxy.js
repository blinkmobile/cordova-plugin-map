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

    MSApp.execUnsafeLocalFunction(function () {
        document.head.insertAdjacentHTML('beforeend', html);
        appendVeapicoreJs();
    });

    function openPopup() {
        MSApp.execUnsafeLocalFunction(function () {
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
        MSApp.execUnsafeLocalFunction(function () {
            var popup = document.getElementById("cordova-plugin-map-popup");
            popup.classList.remove('cordova-plugin-map-nativePopUp-open');
            popup.parentNode.removeChild(popup);
        });
    }

    map = function (options) {};

    map.setOptions = function (options) {
        config.keys.forEach(function(k) {
            if (options[k]) {
                config[k] = options[k];
            }
        });
    };

    map.confirmLocation = function (onSuccess, onError, options) {
        var initMap;

        //check to see if latitude is provided
        if (options.latitude) {
            config.latitude = options.latitude;
        } else if(!config.latitude) {
            onError("latitude must be provided");
        }
        //check to see longitude is provided
        if (options.longitude) {
            config.longitude = options.longitude;
        } else if(!config.longitude) {
            onError("longitude must be provided");
        }
        //check to see bingMapKey is available
        if (options.bingMapKey) {
            config.bingMapKey = options.bingMapKey;
        } else if (!config.bingMapKey) {
            onError("map key must be provided");
        }

        if (options.scale) {
            config.scale = options.scale;
        }

        callbacks.confirmOnSuccess = onSuccess;
        callbacks.confirmOnError = onError;
        callbacks.confirmOptions = options;

        openPopup();

        while (typeof Microsoft == 'undefined' || !Microsoft) {
            setTimeout('', 100);
        }

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

    navigator.map = map;

}());

cordova.commandProxy.add("MapPlugin", {
    confirmLocation: navigator.map.confirmLocation
});
