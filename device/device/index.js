// requires a server running on the computer to read the usb port

var tessel = require('tessel');

//When a message is received from the computer, this event triggers.
process.on('message', function(msg) {
  console.log("[Tessel] Message from PC:", msg);
});

var counter = 0;

// Every 5 seconds...
setInterval(function() {
  // Send a message to the computer
  process.send({count: counter++});
}, 5000);

// Keep the event loop alive
process.ref();
