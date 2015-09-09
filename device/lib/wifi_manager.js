var wifi = require('wifi-cc3000');
var config = require("../config/config.json");

var allowedTimeouts = 0+config.allowedTimouts;

var wifiManager = {
  connect: function connect() {
    console.log("Connecting to %s...", config.wifi.network)

    wifi.connect({
      security: config.wifi.security || 'wpa2'
      , ssid: config.wifi.network
      , password: config.wifi.password
      , timeout: config.wifi.timeout || 20
    });
  }
  ,
  powerCycle: function powerCycle() {
    wifi.reset(function() {
      console.log('Reset called');
      allowedTimeouts = 0+config.allowedTimouts;
      setTimeout(function() {
        if (!wifi.isConnected()) {
          console.log('Wifi not connected, trying...');
          wifiManager.connect()
        }
      }, 20 * 1000);
    })
  }
};

console.log("export wifi manager");
module.exports = wifiManager;
