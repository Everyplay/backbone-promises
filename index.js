var Backbone = require('backdash');
var debug = require('debug')('backbone-promises');
var whenLib = require('when');
var _ = require('lodash');


var Model = exports.Model = Backbone.Model.extend({
  constructor: function() {
    return Backbone.Model.apply(this, arguments);
  },

  save: function(key, val, options) {
    debug('Model.Save');
    var opt, self = this;
    if (!options && (typeof val === "object" || typeof val === "undefined")) {
      opt = val = Promises.wrap(val);
    } else {
      opt = options = Promises.wrap(options);
    }
    var validated = Backbone.Model.prototype.save.call(this, key, val, options);
    if (validated === false) {
      debug('Model validation failed');
      opt.error.call(this, this, this.validationError || new Error('validation failed'));
    }
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
  constructor: function() {
    Backbone.Collection.apply(this, arguments);
    this.on('invalid', this.handleInvalidModel);
  },

  create: function(model, options) {
    debug('Collection.create');
    options = options ? _.clone(options) : {};
    if (!(model = this._prepareModel(model, options))) {
      return whenLib.reject(this.validationError);
    }
    if (!options.wait) this.add(model, options);
    var collection = this;
    var promise = model.save(null, options);
    promise.done(function() {
      if (options.wait) collection.add(model, options);
    }, function(err) {
      return err;
    });
    return promise;
  },

  fetch: function(options) {
    debug('Collection.fetch');
    options = Promises.wrap(options);
    Backbone.Collection.prototype.fetch.call(this, options);
    return options.promise;
  },

  handleInvalidModel: function(collection, validationError, options) {
    this.validationError = validationError;
  }
});

var Promises = _.extend(Backbone.Events, {
  when: whenLib,
  defer: whenLib.defer,
  wrap: function(opt) {
    opt = opt || {};
    var deferred = whenLib.defer();
    var promise = deferred.promise;
    var success = opt.success;
    var error = opt.error;

    opt.success = function() {
      debug("resolving");
      deferred.resolve.apply(deferred, arguments);
      if (success) success.apply(this, arguments);
    };

    opt.error = function(model, err, resp) {
      debug("rejecting", err);
      deferred.reject(err);
      if (error) {
        error.call(this, model, err, resp);
      }
    };

    opt.promise = promise;
    return opt;
  },
  Model: Model,
  Collection: Collection
});

Backbone.Promises = module.exports = Promises;
