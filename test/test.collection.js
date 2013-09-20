
var assert = require('assert');
var Model = require('../').Model;
var Collection = require('../').Collection;
var Backbone = require('backbone');
var Db = require('backbone-db');
var debug = require('debug')('deferred');

var db = Db("mycol");

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
    a.create({id:1,data:"xyz"}).then(function(m) {
      assert(m.get("data") == "xyz");
      t();
    }, function() {
      assert(false);
    });
  });

  it('should have deferred .fetch', function(t) {
    var a = new MyCollection();
    a.fetch().then(function() {
      t();
    }, assert);
  });

});