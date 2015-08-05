var Map = {
    setOptions: function (successCallback, errorCallback, strInput) {
        cordova.exec(successCallback, errorCallback, "MapPlugin", "setOptions", [strInput]);
    },

    confirmLocation: function (successCallback, errorCallback, strInput) {
        cordova.exec(successCallback, errorCallback, "MapPlugin", "confirmLocation", [strInput]);
    }
}

module.exports = Map;
