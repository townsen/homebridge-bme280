'use strict';

const bme280 = require('bme280');
var debug = require('debug')('BME280');
var logger = require("mcuiot-logger").logger;
const moment = require('moment');
var os = require("os");
var hostname = os.hostname();

const delay = millis => new Promise(resolve => setTimeout(resolve, millis));
const fixed2 = number => (Math.round(number * 100) / 100).toFixed(2);
const round1 = number => Math.round(number * 10) / 10;

let Service, Characteristic;
var CustomCharacteristic;
var FakeGatoHistoryService;

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  CustomCharacteristic = require('./lib/CustomCharacteristic.js')(homebridge);
  FakeGatoHistoryService = require('fakegato-history')(homebridge);

  homebridge.registerAccessory('homebridge-bme280', 'BME280', BME280Plugin);
};

class BME280Plugin {
  constructor(log, config) {
    this.log = log;
    this.name = config.name;
    this.name_temperature = config.name_temperature || this.name;
    this.name_humidity    = config.name_humidity || this.name;
    this.refresh = config['refresh'] || 30; // Update every 30 seconds
    this.options = config.options || {};
    if (!("forcedMode" in config.options)) this.options.forcedMode = true;       // default to forcedMode

    this.spreadsheetId = config['spreadsheetId'];
    if (this.spreadsheetId) {
      this.log_event_counter = 59;
      this.logger = new logger(this.spreadsheetId);
    }

    this.init = false;
    this.data = {};
    if ('i2cBusNo' in this.options) this.options.i2cBusNo     = parseInt(this.options.i2cBusNo);
    if ('i2cAddress' in this.options) this.options.i2cAddress = parseInt(this.options.i2cAddress);

    if ('humidityOversampling' in this.options) this.options.humidityOversampling       = eval("bme280."+this.options.humidityOversampling);
    if ('pressureOversampling' in this.options) this.options.pressureOversampling       = eval("bme280."+this.options.pressureOversampling);
    if ('temperatureOversampling' in this.options) this.options.temperatureOversampling = eval("bme280."+this.options.temperatureOversampling);
    if ('filterCoefficient' in this.options) this.options.filterCoefficient             = eval("bme280."+this.options.filterCoefficient);
    if ('standby' in this.options) this.options.standby                                 = eval("bme280."+this.options.standby);
    this.log(`BME280 sensor options: ${JSON.stringify(this.options)}`);

    bme280.open(this.options)
        .then((sensor) => {
          this.log(`BME280 initialization succeeded`);
          this.sensor = sensor;
          this.init = true;
          this.devicePolling.bind(this);
        })
        .catch(err => this.log(`BME280 initialization failed: ${err} `));

    this.informationService = new Service.AccessoryInformation();

    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, "Bosch")
      .setCharacteristic(Characteristic.Model, "RPI-BME280")
      .setCharacteristic(Characteristic.SerialNumber, hostname + "-" + hostname)
      .setCharacteristic(Characteristic.FirmwareRevision, require('./package.json').version);

    this.temperatureService = new Service.TemperatureSensor(this.name_temperature);

    this.temperatureService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .setProps({
        minValue: -100,
        maxValue: 100
      });

    this.temperatureService
      .addCharacteristic(CustomCharacteristic.AtmosphericPressureLevel);

    this.humidityService = new Service.HumiditySensor(this.name_humidity);

    setInterval(this.devicePolling.bind(this), this.refresh * 1000);

    this.temperatureService.log = this.log;
    this.loggingService = new FakeGatoHistoryService("weather", this.temperatureService);
  }

  async forcedRead() {
    await this.sensor.triggerForcedMeasurement();
    await delay( 2* this.sensor.maximumMeasurementTime());
  }

  devicePolling() {
    if (this.sensor) {
      if (this.options.forcedMode) {
        this.forcedRead();
      }
      this.sensor.read()
        .then(data => {
          this.log(`${fixed2(data.temperature)}°C, ` +
                   `${fixed2(data.pressure)} hPa, ` +
                   `${fixed2(data.humidity)}%`);

          this.loggingService.addEntry({
            time: moment().unix(),
            temp: round1(data.temperature),
            pressure: round1(data.pressure),
            humidity: round1(data.humidity)
          });

          if (this.spreadsheetId) {
            this.log_event_counter = this.log_event_counter + 1;
            if (this.log_event_counter > 59) {
              this.logger.storeBME(this.name, 0, round1(data.temperature), round1(data.humidity), round1(data.pressure));
              this.log_event_counter = 0;
            }
          }
          this.temperatureService
            .setCharacteristic(Characteristic.CurrentTemperature, round1(data.temperature));
          this.temperatureService
            .setCharacteristic(CustomCharacteristic.AtmosphericPressureLevel, round1(data.pressure));
          this.humidityService
            .setCharacteristic(Characteristic.CurrentRelativeHumidity, round1(data.humidity));

        })
        .catch(err => {
          this.log(`BME read error: ${err}`);
          debug(err.stack);
          if (this.spreadsheetId) {
            this.logger.storeBME(this.name, 1, -999, -999, -999);
          }

        });
    } else {
      this.log("Error: BME280 Not Initalized");
    }
  }

  getServices() {
    return [this.informationService, this.temperatureService, this.humidityService, this.loggingService]
  }
}

