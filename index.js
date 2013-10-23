var _ = require('underscore');
var Backbone = require('backbone');
var debug = require('debug')('backbone-promises');
var whenLib = require('when');


var Model = exports.Model = Backbone.Model.extend({
  constructor: function() {
    return Backbone.Model.apply(this, arguments)
  },
  save: function(key, val, options) {
    var opt;
    if(!options && (typeof val === "object" || typeof val === "undefined")) {
      debug('wrapping val');
      opt = val = Promises.wrap(val);
    } else {
      opt = options = Promises.wrap(options);
    }
    Backbone.Model.prototype.save.call(this, key, val, options);
    debug('saved');
    return opt.promise;
  },
  fetch: function(options) {
    debug('Model.Fetch');
    options = Promises.wrap(options);
    Backbone.Model.prototype.fetch.call(this, options);
    return options.promise;
  },
  destroy: function(options) {
    debug('Model.Destroy');
    options = Promises.wrap(options);
    Backbone.Model.prototype.destroy.call(this, options);
    return options.promise;
  }
});

var Collection = exports.Collection = Backbone.Collection.extend({
  constructor:function () {
    Backbone.Collection.apply(this, arguments);
  },
  create :function (model, options) {
    debug('Collection.create');
    options = Promises.wrap(options);
    Backbone.Collection.prototype.create.call(this, model, options);
    return options.promise;
  },
  fetch:function (options) {
    debug('Collection.fetch');
    options = Promises.wrap(options);
    Backbone.Collection.prototype.fetch.call(this, options);
    return options.promise;
  }
});

var Promises = _.extend(Backbone.Events, {
  when: whenLib,
  defer: whenLib.defer,
  wrap: function(opt) {
    opt = opt || {};
    var deferred = whenLib.defer();
    var success = opt.success;
    var error = opt.error;
    opt.success = function() {
      if(success) success.apply(success, arguments);
      debug("resolving");
      deferred.resolve.apply(deferred, arguments);
    };
    opt.error = function() {
      if(error) error.apply(error, arguments);
      debug("rejecting");
      deferred.reject.apply(deferred, arguments);
    };
    opt.promise = deferred.promise;
    return opt;
  },
  Model: Model,
  Collection: Collection
});

Backbone.Promises = module.exports = Promises;
