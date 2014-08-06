var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var assert = require('assert');
var Backbone = require('backdash');
var Model = require('./').Model;
var Collection = require('./').Collection;
var Db = require('backbone-db-local');
var debug = require('debug')('deferred');
var _ = require('lodash');
//var when = require('when');
var bluebird = require('bluebird');
//var monitor = require('when/monitor/console');
var db = new Db("test.model");

var MyModel = Model.extend({
  db: db,
  sync: Db.sync,
  url: function() {
    if (this.isNew()) {
      return '/mymodels';
    } else {
      return '/mymodels/' + this.get(this.idAttribute)
    }
  }
});

// add tests
suite
.add('Model#fetch_bluebird', {defer: true, minSamples: 100, fn: function(defer) {
  var id = Math.floor(Math.random() * 10000);
  var m = new MyModel({id:id});
  var models = [];
  for(i = 1; i < 100; i++) {
    var model = new MyModel({id: id + i});
   // model.setPromiseLib(bluebird);
    models.push(model.save({'jep':1}, {wait:true}));
  }
  bluebird.all(models).then(function(models) {
    var opt = {};
    return bluebird.all(models.map(function(m) {
      return m.save({jep: 2}, opt).then(function() {
        var m2 = new MyModel({id: m.id});
       // m2.setPromiseLib(bluebird);
        return m2.fetch().then(function() {
          return true;
        });
      });
    }));
  }).catch(function(e) {
     defer.reject(e);
  }).done(function() {
    defer.resolve();
  }, function(err) {
    defer.reject(err);
  });
}})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
  global.gc();
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
suite.run({async: true});

