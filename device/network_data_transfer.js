// tessel run index.js

var tessel = require('tessel');
var climatelib = require('climate-si7020');
//var https = require('https');
var needle = require("needle");
var config = require("./config/config.json");
var servolib = require('servo-pca9685');
var servo = servolib.use(tessel.port[config.servoPort]);
var relaylib = require("relay-mono");
var relay = relaylib.use(tessel.port[config.relayPort]);
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
      handleResponseActions(resp.body)
    } else {
      console.log("FAIL", error)
    }

    setTimeout( getClimateData, 100)
  });
}

function resetAll() {
  turnOffRelay()
  resetServos()
}

function turnOnRelay() {
  relay.turnOn(1, function(err) { console.log(err); });
}

function turnOffRelay() {
  relay.turnOff(1, function(err) { console.log(err); });
}

var currentServoPosition = 0;

function resetServos() {
  currentServoPosition = 0;
  servo.move(1, currentservoPosition);
};

function activateServo(id, degrees) {
  currentServoPosition += degrees
  if (currentServoPosition >= 1) {
    currentServoPosition = 0;
  }
  servo.move(id, currentServoPosition);
}

function handleResponseActions(actions) {
  console.log("Actions %j", actions);
  resetAll()
  if (actions.servo1 == 'test') {
    console.log("TEST SERVO")
    servo.move(1, 1);
    setTimeout(function() { servo.move(1, 0) }, 500);
  }
  else if (actions.servo1) {
    activateServo(1, actions.servo1);
  }

  if (actions.relay == 'test') {
    console.log("TESTING");
    turnOnRelay();
    setTimeout(turnOffRelay, 500);
  }
  if (actions.relay == 'on') {
    turnOnRelay();
  }
  if (actions.relay == 'off') {
    turnOffRelay();
  }
}

function toggleRelay(relayId) {
  relay.toggle(relayId, function(err) {
    console.log("Toggle1", err);
  });
}

servo.configure(1, .05, .12, function() {
  climate.on('ready', function (err) {
    servo.move(1, 1);
    getClimateData()
    console.log("Climate Module Ready")
  });
});
