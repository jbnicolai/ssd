var Promise = require('bluebird');
var _       = require('lodash');
var async   = require('../async-promisified');
var bindArg = require('./bind-arg');

module.exports = function () {
  return Promise.bind(this)
    .then(function () {
      return _.filter(this.containers, function (container) {
        return !(this.container && this.container.Id === container.Id);
      }, this);
    })
    .then(function (containers) {
      var _this = this;

      return async.eachAsync(containers, function (containerData, cb) {
        return Promise.try(function () {
            return _this.docker.getContainer(containerData.Id);
          })
          .then(function (container) {
            if (/^Up/.test(containerData.Status)) {
              if (!container.stopAsync) {
                Promise.promisifyAll(Object.getPrototypeOf(container));
              }
              return container.stopAsync().then(function () {
                return container.removeAsync().return(null);
              });
            }
          })
          .then(cb, cb);
      });
    });
};