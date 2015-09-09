// tessel run index.js

var tessel = require('tessel');
var climatelib = require('climate-si7020');
var wifi = require('wifi-cc3000');
var https = require('https');


var needle = require("needle");

var config = require("./config/config.json");

var wifiManager = require('./lib/wifi_manager');

var climate = climatelib.use(tessel.port[config.climatePort]);

function getClimateData() {
  climate.readTemperature('c', function (err, temp) {
    climate.readHumidity(function (err, humid) {
      console.log('Degrees:', temp.toFixed(4) + 'C', 'Humidity:', humid.toFixed(4) + '%RH');
      postData({
        "time": time,
        "temp": temp.toFixed(4),
        "humid": humid.toFixed(4)
      })
    });
  });
}

function postData(data) {
  console.log("put to %s", config.controllerUrl)
  var t = (new Date()).getMilliseconds()
  needle.put( config.controllerUrl, data, function(error, resp) {
    var success = (!error && resp.statusCode == 200);

    if (success) {
      console.log("SUCCESS")
    } else {
      console.log("FAIL", error)
    }
  });
}

console.log("Binding to the ambient ready signal");

climate.on('ready', function (err) {
  setInterval( getClimateData, 1000)
  console.log("CLIMATE ERROR: " + err)
});

wifi.on("connect", function(data) {
  console.log('wifi> on:connect', data);
});
wifi.on("disconnect", function(data) {
  console.log('wifi> on:disconnect', data);
});
wifi.on("timeout", function(data) {
  console.log('wifi> on:timeout', data);
  if (timeouts-- > 0) {
    console.log("simple reconnect...");
    wifiManager.connect()
  } else {
    wifiManager.powerCycle()
  }
});
wifi.on("error", function(data) {
  console.log('wifi> on:error', data);
});

console.log("Running...")
console.log("%j", wifiManager)
wifiManager.connect()
