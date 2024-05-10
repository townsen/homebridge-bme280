# homebridge-bme280

[Bosch BME280](https://www.bosch-sensortec.com/bst/products/all_products/bme280)
temperature/humidity/barometric pressure sensor service plugin for [Homebridge](https://github.com/nfarina/homebridge).

[![NPM Downloads](https://img.shields.io/npm/dm/@iainfarq/homebridge-bme280.svg?style=flat)](https://npmjs.org/package/@iainfarq/homebridge-bme280)

* Display of temperature, humidity and Barometric Pressure from a BME280 connected to a RaspberryPI.
* Archives results every hour to a google spreadsheet
* Support the graphing feature of the Eve app for trends

Forked from  [homebridge-280](https://www.npmjs.com/package/homebridge-bme280)
to use [bme280](https://www.npmjs.com/package/bme280), which has a full implementation of the BME280 options. See the datasheet for all oversampling and filtering options.

## Installation
0. Ensure that you have `i2c` support in your OS. For Raspbian (Bullseye) do:

    apt-get install i2c_tools libi2c_dev
    modprobe i2c_dev
    add `i2c_dev` to `/etc/modules`

1.	Install Homebridge using `npm install -g homebridge`
2.	Install this plugin `npm install -g @iainfarq/homebridge-bme280`
3.	Update your configuration file - see below for an example

Follow the excellent directions in the [bme280](https://www.npmjs.com/package/bme280) package to connect the device to the I2C bus.

## Configuration
* `accessory`: "BME280"
* `name`: descriptive name
* `name_temperature` (optional): descriptive name for the temperature sensor
* `name_humidity` (optional): descriptive name for the humidity sensor
* `refresh`: Optional, time interval for refreshing data in seconds, defaults to 30 seconds.
* `options`: options for [bme280](https://www.npmjs.com/package/bme280). Note that the 'forcedMode' option is set to true by default; this should better match
any homebridge use - self heating is reduced, and the sensor is only active once per refresh cycle.

If you get an I/O error, make sure the I2C address is correct (usually 0x76 or 0x77 depending on a jumper).

Simple Configuration

```json
{
  "bridge": {
    "name": "BME280Example",
    "username": "CB:22:33:E2:CE:31",
    "port": 51826,
    "pin": "033-44-254"
  },
  "accessories": [
    {
      "accessory": "BME280",
      "name": "Sensor",
      "name_temperature": "Temperature",
      "name_humidity": "Humidity",
      "options": {
        "i2cBusNo": 1,
        "i2cAddress": "0x77"
      }
    }
  ],
  "platforms": []
}
```

More complex configuration, using all available [bme280](https://www.npmjs.com/package/bme280) options:

```json
{
  "bridge": {
    "name": "BME280Example",
    "username": "CB:22:33:E2:CE:31",
    "port": 51826,
    "pin": "033-44-254"
  },
  "accessories": [
    {
      "accessory": "BME280",
      "name": "Sensor",
      "name_temperature": "Temperature",
      "name_humidity": "Humidity",
      "refresh": 15,
      "options": {
        "i2cBusNo": 1,
        "i2cAddress": "0x77",
        "humidityOversampling": "OVERSAMPLE.X8",
        "pressureOversampling": "OVERSAMPLE.X16",
        "temperatureOversampling": "OVERSAMPLE.X2",
        "filterCoefficient": "FILTER.F16",
        "standby": "STANDBY.MS_20",
        "forcedMode": false
      }
    }
  ],
  "platforms": []
}
```

This plugin creates two services: TemperatureSensor and HumiditySensor.

## Problems

If you get ... bindings

[24/09/2023, 10:42:27] ERROR LOADING PLUGIN @townsen/homebridge-bme280:
[24/09/2023, 10:42:27] Error: Could not locate the bindings file. Tried:
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/build/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/build/Debug/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/build/Release/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/out/Debug/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/Debug/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/out/Release/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/Release/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/build/default/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/compiled/18.16.0/linux/arm/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/addon-build/release/install-root/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/addon-build/debug/install-root/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/addon-build/default/install-root/i2c.node
 → /var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/lib/binding/node-v108-linux-arm/i2c.node
    at bindings (/var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/bindings/bindings.js:126:9)
    at Object.<anonymous> (/var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/i2c-bus/i2c-bus.js:4:32)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
    at Module.load (node:internal/modules/cjs/loader:1117:32)
    at Function.Module._load (node:internal/modules/cjs/loader:958:12)
    at Module.require (node:internal/modules/cjs/loader:1141:19)
    at require (node:internal/modules/cjs/helpers:110:18)
    at Object.<anonymous> (/var/lib/homebridge/node_modules/@townsen/homebridge-bme280/node_modules/bme280/bme280.js:3:13)
    at Module._compile (node:internal/modules/cjs/loader:1254:14)

Then you need to do an install in the i2c-bus module. `npm install`. This recompiles the C
bindings.

## Credits

* NorthernMan54 - Barometric Pressure and Device Polling
* simont77 - History Service
* fivdi - Comprehensive implementation of the BME280 interface

## License

MIT
