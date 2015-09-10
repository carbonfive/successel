// tessel run index.js

var tessel = require('tessel');
var climatelib = require('climate-si7020');
//var https = require('https');
var needle = require("needle");
var config = require("./config/config.json");
var servolib = require('servo-pca9685');
var servo = servolib.use(tessel.port['D']);

var climate = climatelib.use(tessel.port[config.climatePort]);

function getClimateData() {
  climate.readTemperature('c', function (err, temp) {
    climate.readHumidity(function (err, humid) {
      console.log('Degrees:', temp.toFixed(4) + 'C', 'Humidity:', humid.toFixed(4) + '%RH');
      postData({
        "time": Math.floor(Date.now()),
        "climate": {
          "temperature": temp.toFixed(4),
          "humidity": humid.toFixed(4)
        }
      })
    });
  });
}

function postData(data) {
  console.log("%j", data);
  console.log("put to %s", config.controllerUrl);
  needle.put( config.controllerUrl, data, function(error, resp) {
    var success = (!error && resp.statusCode == 200);

    if (success) {
      console.log("SUCCESS")
//      handleResponseActions(response.body)
      activateServo(1, 0.1);
    } else {
      console.log("FAIL", error)
    }

    setTimeout( getClimateData, 100)
  });
}

var pos = 0;
function activateServo(id, degrees) {
  pos += degrees
  if (pos >= 1) {
    pos = 0;
  }
  servo.move(id, pos);
}

function handleResponseActions(actions) {
  if (actions.servo1 != null) {
    activateServo(1, actions.servo1);
  }
  if (actions.servo2 != null) {
    activateServo(2, actions.servo2);
  }
}

servo.configure(1, .05, .12, function() {
  climate.on('ready', function (err) {
    servo.move(1, 1);
    getClimateData()
    console.log("Climate Module Ready")
  });
});
