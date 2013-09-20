var _ = require('underscore');
var Backbone = require('backbone');
var debug = require('debug')('backbone-promises');
var when = require('when');

function bbPromise(opt, deferred) {
  var fn = function(err, res) {
    var args = [].slice.apply(arguments);
    if(typeof opt === "function") {
      opt(err, res);
    }
    if(err) {
      if(opt && opt.error) opt.error(err);
      deferred.resolver.reject(err);
      opt = null;
    } else {
      if(opt && opt.success) opt.success.apply(this, arguments);
      deferred.resolver.resolve(args);
      opt = null;
    }
  };

  fn.error = function(err) {
    fn(err);
  };
  fn.success = function() {
    var args = [].slice.apply(arguments);
    args.unshift(null);
    fn.apply(this, args);
  }
  // yeolde compatability
  fn.fail = fn.error;
  fn.done = fn.success;
  return fn;
}

var Model = exports.Model = Backbone.Model.extend({
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