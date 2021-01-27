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

## Credits

* NorthernMan54 - Barometric Pressure and Device Polling
* simont77 - History Service
* fivdi - Comprehensive implementation of the BME280 interface

## License

MIT
