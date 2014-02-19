five = require("johnny-five"),
board = new five.Board(),
request = require('request');

// Parameters
var selectedSymbol = "BTCUSD";
var requestInterval = 2000; // 20 mn
var relayToggleInterval = 1000; // length of bubble animation when bitcoin value has changed
var servoMaxAngle = 180;
var servoMinAngle = 45;
var servoPin = 9;
var relayPin = 10;
var debug = false;

// Variables
var servo;
var relay;
var previousValue;

board.on("ready", function() {
    // Arduino setup
    servo = new five.Servo({
        pin: servoPin,
        range: [servoMinAngle, servoMaxAngle]
    });    
    relay = new five.Relay(relayPin);
    // Enable periodical requests
    updateSymbolStats(); // do it a first time
    setInterval(updateSymbolStats, requestInterval);
});

function updateSymbolStats() {
    if (!debug) {
        request('http://data.mtgox.com/api/2/' + selectedSymbol + '/money/ticker', function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var symbolStats = JSON.parse(body).data;
                console.log("---- time: " + new Date());
                console.log("---- high: " + symbolStats.high.value);
                console.log("---- low: " + symbolStats.low.value);
                console.log("---- last: " + symbolStats.last.value);
                console.log("---- last_local: " + symbolStats.last_local.value);
                console.log("---- last_orig: " + symbolStats.last_orig.value);
                console.log("---- last_all: " + symbolStats.last_all.value);
                var high = symbolStats.high.value;
                var low = symbolStats.low.value;
                // var value = symbolStats.last_all.value;
                servo.to(computePos(value, high, low));
                if (previousValue !== value) {
                    relay.on();
                    setTimeout(function() {
                        relay.off();
                    }, relayToggleInterval);
                }
                previousValue = value;
            }
        });
    } else {
        var value = Math.floor(Math.random() * 135) + 45;
        console.log(value);
        servo.to(value);
    }
}

function computePos(value, high, low) {
    return (servoMaxAngle - servoMinAngle) / (high - low) * (value - low) + servoMinAngle;
}
