var assert = require('assert');
var Backbone = require('backbone');
var Model = require('../').Model;
var Collection = require('../').Collection;
var Db = require('backbone-db');
var debug = require('debug')('promises');
var when = require('../').when;
var db = Db("mycol");
var expect = require('chai').expect
var monitor = require('when/monitor/console');

var MyModel = Model.extend({
  db: db,
  sync: Db.sync,
  url: function() {
    if (this.isNew()) {
      return "/tests";
    } else {
      return "/tests/" + this.get(this.idAttribute);
    }
  }
});

var MyCollection = Collection.extend({
  db: db,
  sync: Db.sync,
  model: MyModel,
  url: function() {
    return "/tests";
  }
});

var ErrorModel = MyModel.extend({
  validate: function() {
    return new Error("Foo error");
  }
});

var ErrorCollection = MyCollection.extend({
  model: ErrorModel
});


describe('#Collection', function() {
  after(function(next) {
    // catch unhandled errors
    setTimeout(next, 50);
  });

  it('should have deferred .create', function(t) {
    var a = new MyCollection();
    var m1 = a.create({
      id: 1,
      data: "xyz"
    });
    var m2 = a.create({
      id: 2,
      data: "zyx"
    });
    var m3 = a.create({
      id: 3,
      data: ""
    }, {wait: true});
    Backbone.Promises.when.join(m1, m2, m3).done(function(values) {
      assert(values[0].get('data') == "xyz");
      assert(values[1].get('data') == "zyx");
      assert(values[2].get('data') == "");
      assert(a.length === 3);
      t();
    }, t);
  });

  it('should have deferred .fetch', function(t) {
    var a = new MyCollection();
    a.fetch().done(function() {
      t();
    }, t);
  });

  it('should handle error on .create', function(t) {
    var collection = new ErrorCollection();
    collection
      .create({
        foo: 1
      })
      .done(function() {
        assert.ok(false, 'should not allow creating model when validation fails');
      }, function(err) {
        assert.ok(err != null);
        t();
      });
  });

  it('should handle error on .create when validating', function(t) {
    var collection = new ErrorCollection();
    collection
      .create({
        foo: 1
      }, {validate: true})
      .done(function() {
        assert.ok(false, 'should not allow creating model when validation fails');
      }, function(err) {
        assert(err);
        assert.equal(err.message, 'Foo error');
        t();
      });
  });

});