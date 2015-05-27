var Map = {
    confirmLocation:function(successCallback, errorCallback, strInput) {
        cordova.exec(successCallback,errorCallback,"MapPlugin","confirmLocation",[strInput]);
    }
}

module.exports = Map;
