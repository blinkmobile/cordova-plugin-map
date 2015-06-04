(function () {
    'use strict';
    var divId = "cordova-plugin-map-mapDiv", lat = -33.4270, long = 151.3428, scale = 17;
    var bingMapKey = "AnnB69EpEvcSWECyb7esv5AGzKccK4Vt7m_Cxhk-QtYk-dZzs4HA139yfI5YXRxS";
    var pinLocation;
    var initCenter;
    var confirmOnSuccess, confirmOnError, confirmOptions;

    var html = '<link rel="stylesheet" href="css/cordova-plugin-map.css" />';

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

    var popupHtml = '<div id="cordova-plugin-map-popup" class="cordova-plugin-map-nativePopUp cordova-plugin-map-layout-withOrientation"><div id="cordova-plugin-map-mapDiv" class="cordova-plugin-map-nativePopUp__content"></div><div class="cordova-plugin-map-nativePopUp__buttons cordova-plugin-map-layout-oppositeOrientation"><button data-action="done"  class="cordova-plugin-map-nativePopUp__button">done</button><button data-action="cancel" class="cordova-plugin-map-nativePopUp__button">cancel</button></div></div>';

    function callbackFunction() {
    };

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
        confirmLocation(confirmOnSuccess, confirmOnError, confirmOptions);
    }

    function closePopup() {
        callbackFunction({latitude: pinLocation.latitude, longitude: pinLocation.longitude});
        deletePopup();
    }

    function cancelPopup() {
        callbackFunction(null);
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


    function Map(options) {
    }


    Map.confirmLocation = function (onSuccess, onError, options) {
        if (options.latitude) {
            lat = options.latitude;
        } else {
            onError("latitude must be provided");
        }
        if (options.longitude) {
            long = options.longitude;
        } else {
            onError("longitude must be provided");
        }
        if (options.bingMapKey) {
            bingMapKey = options.bingMapKey;
        } else {
            onError("map key must be provided");
        }
        if (options.scale)
            scale = options.scale;

        callbackFunction = onSuccess;
        confirmOnSuccess = onSuccess;
        confirmOnError = onError;
        confirmOptions = options;

        openPopup();

        while (typeof Microsoft == 'undefined' || !Microsoft) {
            setTimeout('', 100);
        }

        Microsoft.Maps.loadModule('Microsoft.Maps.Map', {callback: initMap, culture: "en-us", homeRegion: "AU"});

        function initMap() {
            var bingMap;
            if (!initCenter)
                initCenter = new Microsoft.Maps.Location(lat, long);
            if (!pinLocation)
                pinLocation = new Microsoft.Maps.Location(lat, long);

            var mapDiv = document.getElementById(divId);
            var rect = mapDiv.getBoundingClientRect();

            var mapOptions =
            {
                credentials: bingMapKey,
                center: pinLocation,
                zoom: scale,
                height: rect.height,
                width: rect.width
            };

            bingMap = new Microsoft.Maps.Map(mapDiv, mapOptions);

            // Add a pin to the center of the map
            var pin = new Microsoft.Maps.Pushpin(pinLocation, {draggable: true});

            // Add a handler to the pushpin drag
            Microsoft.Maps.Events.addHandler(pin, 'mouseup', DisplayLoc);

            bingMap.entities.push(pin);
        }

        function DisplayLoc(e) {
            if (e.targetType == 'pushpin') {
                pinLocation = e.target.getLocation();
            }
            return;
        }
    };

    navigator.map = Map;

}());

cordova.commandProxy.add("MapPlugin", {
    confirmLocation: navigator.map.confirmLocation
});
