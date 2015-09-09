// tessel run index.js

var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var climatelib = require('climate-si7020');
var wifi = require('wifi-cc3000');
var https = require('https');
var needle = require("needle");

var config = require("./config/config.json");

var wifiManager = require('./lib/wifi_manager');

var ambient = ambientlib.use(tessel.port[config.ambientPort]);
var climate = climatelib.use(tessel.port[config.climatePort]);
// var led1 = tessel.led[0].output(1);
// var led2 = tessel.led[1].output(1);

function getLightLevel() {
  ambient.getLightLevel( function(err, ldata) {
    if (err) throw err;
    ambient.getSoundLevel( function(err, sdata) {
      if (err) throw err;

      climate.readTemperature('c', function (err, temp) {
        climate.readHumidity(function (err, humid) {
          console.log('Degrees:', temp.toFixed(4) + 'C', 'Humidity:', humid.toFixed(4) + '%RH');
          console.log("Light level:", ldata.toFixed(8), " ", "Sound Level:", sdata.toFixed(8));
          postData({
            "time": time,
            "light": ldata.toFixed(8),
            "sound": sdata.toFixed(8),
            "temp": temp.toFixed(4),
            "humid": humid.toFixed(4)
          })
        });
      });
    });
  });
}

var httpTiming = {
  requests: 0
  , successRequests: 0
  , failedRequests: 0
  , duration: 0.0
  , rate: function() {
    if (this.requests > 1) {
      return 1000.0 * (0.0 + this.requests)/ this.duration
    }
    else {
      0.0
    }
  }
  , lostRequests: function() {
    return this.requests - this.finishedRequests();
  }
  , finishedRequests: function() {
    return this.successRequests + this.failedRequests;
  }

}

function countRequestStart() {
  httpTiming.requests += 1
}

function trackRequestTiming(duration, success) {
  httpTiming.duration += duration;
  if (success === true) {
    httpTiming.successRequests += 1
  }
  if (success === false) {
    httpTiming.failedRequests += 1
  }
}

function logRequestTiming() {
  console.log("Processed %d of %d requests in %d msec (%d req/sec)", httpTiming.finishedRequests(), httpTiming.requests, httpTiming.duration, httpTiming.rate());
}

function postData(data) {
  console.log("posting to %s", config.repoUrl)
  var t = (new Date()).getMilliseconds()
  countRequestStart()
  needle.post( config.repoUrl, data, function(error, resp) {
    var success = (!error && resp.statusCode == 200);
    var dt = (new Date()).getMilliseconds() - t;
    trackRequestTiming(dt, success);

    if (success) {
      console.log("SUCCESS")
    } else {
      console.log("FAIL", error)
    }
  });
}

console.log("Binding to the ambient ready signal");
ambient.on('ready', function () {
  setInterval( getLightLevel, 200)
  setInterval( logRequestTiming, 5000)
});

ambient.on('error', function (err) {
  console.log("AMBIENT ERROR: " + err)
});

climate.on('error', function (err) {
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


// function postToFirebase(data) {
//   led2.toggle();
//   console.log("postData to " + firebaseData.host);

//   var options = {
//     hostname: firebaseData.host,
//     port: 80,
//     path: '/tessel/sensors.json',
//     method: 'POST'
//   };

//   var req = https.request(options, function(res) {
//     console.log('STATUS: ' + res.statusCode);
//     led2.toggle();
//     getLightLevel();
//   });

//   req.on('error', function(e) {
//     console.error("Request error: " + e);
//   });

//   var time = new Date().getTime();
//   req.write(JSON.stringify(data));
//   req.end();
// }
