/*
 Chat Example for Bluetooth Serial PhoneGap Plugin
 http://github.com/don/BluetoothSerial

 Copyright 2013 Don Coleman

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/* jshint quotmark: false, unused: vars */
/* global cordova, bluetoothSerial, listButton, connectButton, sendButton, disconnectButton */
/* global chatform, deviceList, message, messages, statusMessage, chat, connection */
'use strict';

var app;
app = {
    initialize: function () {
        this.bind();
        listButton.style.display = "none";
    },
    bind: function () {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function () {
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.foo(), and not this.foo()

        // wire buttons to functions
        connectButton.ontouchstart = app.connect;
        listButton.ontouchstart = app.list;

        sendButton.ontouchstart = app.sendData;
        //send1Button.ontouchstart = app.send1Data;
        chatform.onsubmit = app.sendData;
        //chatform.onsubmit = app.send1Data;
        disconnectButton.ontouchstart = app.disconnect;

        // listen for messages
        bluetoothSerial.subscribe("\n", app.onmessage, app.generateFailureFunction("Subscribe Failed"));

        // get a list of peers
        setTimeout(app.list, 2000);
    },
    list: function (event) {
        deviceList.firstChild.innerHTML = "Discovering...";
        app.setStatus("Looking for Bluetooth Devices...");
        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("List Failed"));
    },
    connect: function () {
        var device = deviceList[deviceList.selectedIndex].value;
        app.disable(connectButton);
        app.setStatus("Connecting...");
        console.log("Requesting connection to " + device);
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);
    },
    disconnect: function (event) {
        if (event) {
            event.preventDefault();
        }

        app.setStatus("Disconnecting...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },

    hexfn: function (hexx) {
       // hexx = hexx.replace(/(\r\n|\n|\r)/gm, "");
        //hexx = hexx.replace(/ /g, '');

        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; i < hex.length; i++) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        str = str.replace(/\s+/g, '');
        str = str.replace(/(I)/g, '');
        return str;
    },

        /*
        vinParser1: function (input) {

        input = input.replace(/(\r\n|\n|\r)/gm, "");

        input = input.replace(/ /g, '');


        var groupElements = function (arr) {
            var finalOutput = [];

            var i;
            for (i = 0; i < arr.length; i = i + 2) {
                finalOutput.push(arr[i] + arr[i + 1])
            }
            return finalOutput;
        };


        var cleanUp = function (arr) {
            var finalOutput = [];
            var remove = [0, 1, 2, 7, 8, 9, 14, 15, 16, 21, 22, 23, 28, 29, 30];
            arr.forEach(function (elem, index, array) {
                if (remove.indexOf(index) === -1 && elem !== "00") {
                    finalOutput.push(elem);
                }
            });
            return finalOutput;
        };

        var arrToString = function (arr) {
            var finalString = "";
            arr.forEach(function (elem, index, array) {
                finalString += elem + " ";
            });
            return finalString;
        };

        return arrToString(cleanUp(groupElements(input)));
    },
    */
   /* send1Data: function (event){
        event.preventDefault();
        var r = null;
        var text = "03 \r";
        var success = function () {
            message.value = "";
            messages.value += ("Us: " + text);
            messages.scrollTop = messages.scrollHeight;
        };
        bluetoothSerial.write(text, success);

        bluetoothSerial.read(function (data) {
            messages.value += ("Hexfn: " +app.hexfn(data)+ "\r" ) ;
            messages.value += ("straightdata: " + data+ "\r" ) ;
            messages.scrollTop = messages.scrollHeight;
        },  function () {
            messages.value += ("Failed!");
            messages.scrollTop = messages.scrollHeight;

        })
        return false;
    },*/
    sendData: function (event) {
        event.preventDefault();
        var r = null;
        var text = "09 02 \r";
        var success = function () {
            message.value = "";
            messages.value += ("Us: " + text);
            messages.scrollTop = messages.scrollHeight;
        };

        /*var input = ("49 02 01 00 00 00 57\n" +
         "49 02 02 42 41 45 56\n" +
         "49 02 03 33 33 34 58\n" +
         "49 02 04 34 4B 52 32\n" +
         "49 02 05 36 39 30 36\n");
        messages.value += ("ideal: " + app.hexfn(app.vinParser(input)) + "\r" ) ;*/

        bluetoothSerial.write(text, success);

        //var vinString='';

        bluetoothSerial.read(function (data) {
            messages.value += ("Hexfn: " +app.hexfn(data)+ "\r" ) ; // convert VIN directly to hex this is what works
            messages.value += ("straightdata: " + data+ "\r" ) ; // the data recieved directly from module
            // messages.value += ("Them: " + data);
            messages.scrollTop = messages.scrollHeight;
        },  function () {
            messages.value += ("Failed!");
            messages.scrollTop = messages.scrollHeight;

        })


        //var parse = app.vinParser(vinString);


        //WHATEVER();
        return false;
    },

    ondevicelist: function (devices) {
        var option;

        // remove existing devices
        deviceList.innerHTML = "";
        app.setStatus("");

        devices.forEach(function (device) {

            option = document.createElement('option');
            if (device.hasOwnProperty("uuid")) {
                option.value = device.uuid;
            } else if (device.hasOwnProperty("address")) {
                option.value = device.address;
            } else {
                option.value = "ERROR " + JSON.stringify(device);
            }
            option.innerHTML = device.name;
            deviceList.appendChild(option);
        });

        if (devices.length === 0) {

            option = document.createElement('option');
            option.innerHTML = "No Bluetooth Devices";
            deviceList.appendChild(option);

            if (cordova.platformId === "ios") { // BLE
                app.setStatus("No Bluetooth Peripherals Discovered.");
            } else { // Android
                app.setStatus("Please Pair a Bluetooth Device.");
            }

            app.disable(connectButton);
            listButton.style.display = "";
        } else {
            app.enable(connectButton);
            listButton.style.display = "none";
            app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
        }

    },
    onconnect: function () {
        connection.style.display = "none";
        chat.style.display = "block";
        app.setStatus("Connected");
    },
    ondisconnect: function (reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
        connection.style.display = "block";
        app.enable(connectButton);
        chat.style.display = "none";
        app.setStatus("Disconnected");
    },
    onmessage: function (message) {
        messages.value += "Them: " + message;
        messages.scrollTop = messages.scrollHeight;
    },
    setStatus: function (message) { // setStatus
        console.log(message);

        window.clearTimeout(app.statusTimeout);
        statusMessage.innerHTML = message;
        statusMessage.className = 'fadein';

        // automatically clear the status with a timer
        app.statusTimeout = setTimeout(function () {
            statusMessage.className = 'fadeout';
        }, 5000);
    },
    enable: function (button) {
        button.className = button.className.replace(/\bis-disabled\b/g, '');
    },
    disable: function (button) {
        if (!button.className.match(/is-disabled/)) {
            button.className += " is-disabled";
        }
    },
    generateFailureFunction: function (message) {
        var func = function (reason) { // some failure callbacks pass a reason
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            app.setStatus(message + details);
        };
        return func;
    }
};

/*
 sendData: function(event) {
 event.preventDefault();
 var r = null;
 var text = message.value + "\r";
 var success = function () {
 message.value = "";
 messages.value += ("Us: " + text);
 messages.scrollTop = messages.scrollHeight;
 };

 bluetoothSerial.write(text, success);
 /*
 while(r !== null){
 var readData = function () {
 var readValue_string;
 bluetoothSerial.read(readvalue_string,)
 };
 readData();
 }

bluetoothSerial.read(function (data) {
    messages.value += ("Them: " + data);
    messages.scrollTop = messages.scrollHeight;
}, function () {
    messages.value += ("Failed!");
    messages.scrollTop = messages.scrollHeight;
});
return false;
},*/


