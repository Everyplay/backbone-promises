var _ = require('underscore');
var Backbone = require('backbone');
var debug = require('debug')('backbone-promises');
var when = require('when');

function bbPromise(opt, deferred) {
  opt = opt || {};
  var success = opt.success;
  var error = opt.error;
  opt.success = function() {
    if(success) success.apply(this, arguments);
    if(typeof opt === "function") {
      var args = [].slice.call(arguments);
      args.unshift(null);
      opt.apply(this, args);
    }
    deferred.resolve.apply(this, arguments);
  };
  opt.error = function() {
    if(success) error.apply(this, arguments);
    if(typeof opt === "function") opt.apply(this, arguments);
    deferred.reject.apply(this, arguments);
  };
  return opt;
}

var Model = exports.Model = Backbone.Model.extend({
  constructor: function() {
    return Backbone.Model.apply(this, arguments)
  },
  save: function(key, val, options) {
    var deferred = when.defer();
    if(!options && (typeof val === "object" || typeof val === "undefined" || typeof val === "function")) {
      val = bbPromise(val, deferred);
    } else {
      options = bbPromise(options, deferred);
    }
    Backbone.Model.prototype.save.call(this, key, val, options);
    return deferred.promise;
  },
  fetch: function(options) {
    var deferred = when.defer();
    options = bbPromise(options, deferred);
    Backbone.Model.prototype.fetch.call(this, options);
    return deferred.promise;
  }
});

var Collection = exports.Collection = Backbone.Collection.extend({
  constructor: function() {
    Backbone.Collection.apply(this, arguments);
  },
  create: function(model, options) {
    var deferred = when.defer();
    options = bbPromise(options, deferred);
    Backbone.Collection.prototype.create.call(this, model, options);
    return deferred.promise;
  },
  fetch: function(options) {
    var deferred = when.defer();
    options = bbPromise(options, deferred);
    Backbone.Collection.prototype.fetch.call(this, options);
    return deferred.promise;
  }
});