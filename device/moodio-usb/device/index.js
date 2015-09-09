// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

// The `tessel` module built-in to the Tessel firmware for access to hardware
var tessel = require('tessel');
var ambientlib = require('ambient-attx4');
var climatelib = require('climate-si7020');

var ambient = ambientlib.use(tessel.port['A']);
var climate = climatelib.use(tessel.port['B']);
var led1 = tessel.led[0].output(0);
var led2 = tessel.led[1].output(1);

function getLightLevel() {
  ambient.getLightLevel( function(err, ldata) {
    if (err) throw err;
    ambient.getSoundLevel( function(err, sdata) {
      if (err) throw err;

      climate.readTemperature('c', function (err, temp) {
        climate.readHumidity(function (err, humid) {
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

function postData(data) {
  process.send(data);
}

function alternateLights() {
  // setInterval(function(){
  //   led1.toggle();
  // }, 1000);

  // setTimeout(function(){
  //   setInterval(function(){
  //     led2.toggle();
  //   }, 1000);
  // }, 500);
}

ambient.on('ready', function () {
  alternateLights();
  getLightLevel();
  setInterval( function () {
    getLightLevel();
  }, 50);
});

ambient.on('error', function (err) {
  console.log("AMBIENT ERROR: " + err)
});

climate.on('error', function (err) {
  console.log("CLIMATE ERROR: " + err)
});

// Keep the event loop alive
process.ref();
