/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
// Leave the above lines for propper jshinting
//Type Node.js Here :)
var mqtt = require('mqtt');
var mraa = require('mraa');

// credential parameters assigned when you subscribe your device to IoT founcation
var org = "gyyqov";                     // <--- update!!
var type = "myedison";                  // <--- update!!
var id = "784b87a00ebf";                // <--- update!!
var auth_token = "kPSf9slYBK6vX+r4!3";  // <--- update!!

var authmethod = 'use-token-auth';      // You don't need update this parm

// create clientID and URL to connect IoT foundation
var clientId = 'd:' + org + ':' + type + ':' + id;
var mqtt_url = 'mqtt://' + org + '.messaging.internetofthings.ibmcloud.com:1883';
var credentials = { clientId: clientId, username: authmethod, password: auth_token };

// create a mqtt client
var client  = mqtt.connect(mqtt_url, credentials);

// connect and process
client.on('connect', function () {
    var pub_topic = 'iot-2/evt/status/fmt/json';    // publish a message to a topic
    var pub_message;                                // message to be published
    var sub_topic = 'iot-2/cmd/cid/fmt/json';       // topic to subscribe
    var sub_message;                                // message reached to topic subscribing

// publish message to IoT foundation
  setInterval(function(){
      pub_message = '{"d":{"brightness":' + analogVolts() + '}}'; // publish value from light sensor
      client.publish(pub_topic, pub_message, function() {
          console.log("Message is published");
      });
  },1000);

//subscribe to a topic
    client.subscribe(sub_topic, function() {
        // when a message arrives, do something with it
        client.on('message', function(topic, message, packet) {
            sub_message = message;
            console.log("Received '" + sub_message + "' on '" + topic + "'");
            
            if (JSON.parse(sub_message).LED === "on") {  // when parameter LED is "on", LED is blinked.
                myOnboardLed.write(1);
            } else {
                myOnboardLed.write(0);
            }
        });
    });
});

// Read Analog output A0
var pin0 = new mraa.Aio(0);
var analogVolts = function() {
    var counts = pin0.read();
    return counts;
};

// Send signal to light LED connected to GPIO(13)
var myOnboardLed = new mraa.Gpio(13); //LED hooked up to digital pin 13 (or built in pin on Intel Galileo Gen2 as well as Intel Edison)
myOnboardLed.dir(mraa.DIR_OUT); //set the gpio direction to output
