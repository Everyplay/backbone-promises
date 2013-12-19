
var assert = require('assert');
var Backbone = require('backbone');
var Model = require('../').Model;
var Collection = require('../').Collection;
var Db = require('backbone-db');
var debug = require('debug')('promises');
var when = require('../').when;
var db = Db("mycol");
var expect = require('chai').expect

var MyModel = Model.extend({
  db: db,
  sync: Db.sync,
  url: function() {
    if(this.isNew()) {
      return "/tests";
    } else {
      return "/tests/"+this.get(this.idAttribute);
    }
  }
});

var MyCollection = Collection.extend({
  db:db,
  sync: Db.sync,
  model: MyModel,
  url: function() {
    return "/tests";
  }
});


describe('#Collection', function() {
  it('should have deferred .create', function(t) {
    var a = new MyCollection();
    var m1 = a.create({id:1,data:"xyz"});
    var m2 = a.create({id:2,data:"zyx"});
    var m3 = a.create({id:3,data:""});
    Backbone.Promises.when.join(m1,m2,m3).then(function(values) {
      assert(values[0].get('data') == "xyz");
      assert(values[1].get('data') == "zyx");
      assert(values[2].get('data') == "");
      t();
    },assert).otherwise(assert);
  });

  it('should have deferred .fetch', function(t) {
    var a = new MyCollection();
    a.fetch().then(function() {
      t();
    }, assert);
  });

  it('should handle error on .create', function(t) {
    var ErrorModel = MyModel.extend({
      validate: function() {
        return "Foo error";
      }
    });
    var ErrorCollection = MyCollection.extend({
      model: ErrorModel
    });
    var collection = new ErrorCollection();
    collection
      .create({foo: 1})
      .then(function() {
        assert(false, 'should not allow creating model when validation fails');
      }, function(err) {
        assert(err);
        t();
      });
  });
});