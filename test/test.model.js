var assert = require('assert');
var Model = require('../').Model;
var Backbone = require('backbone');
var Db = require('backbone-db');
var Deferred = require('../');
var debug = require('debug')('deferred');
var db = new Db("test");

Backbone.sync = Db.sync;

var MyModel = Deferred.Model.extend({
  db: db,
  sync: Db.sync,
  url: function() {
    if(this.isNew()) return "mymodel";
    return "mymodel:"+this.get(this.idAttribute);
  }
});

describe('#Model', function() {
  it('should have deferred .save', function(t) {
    var m = new MyModel({id:1});
    m.save().then(function() {
      t();
    }, assert);
  })
  it('should have deferred .save and .fetch', function(t) {
    var m = new MyModel({id:2,"test":"a"});
    m.save().then(function(a) {
      var m2 = new MyModel({id:2});
      m2.fetch().then(function(model) {
        assert(model.get("test") == "a");
        t();
      }, assert);
    }, assert);
  });

  it('Should maintain classic behaviour', function(t) {
    var m = new MyModel({id:1,"test":"a"});
    m.save({variable:"123"},{success: function() {
      var m2 = new MyModel({id:1});
      m2.fetch({success: function() {
        assert.equal(m2.get("variable"),"123");
        assert.equal(m2.get("test"),"a")
        var maa = new MyModel({id:123123});

        maa.fetch({success: function(asd) {
          assert(false, "success called while fetching non-existing key")
        }, error: function(err) {
          t();
        }});
      },
      error: function(err) {
        assert.ok(false);
      }});
    }});
  });

});