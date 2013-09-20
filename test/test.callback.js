var assert = require('assert');
var Model = require('../').Model;
var Backbone = require('backbone');
var Db = require('backbone-db');
var Deferred = require('../');

var debug = require('debug')('deferred');
var db = new Db("test.callback");


var MyModel = Deferred.Model.extend({
  db: db,
  sync: Db.sync,
  url: function() {
    if(this.isNew()) return "/mymodels";
    return "mymodel:"+this.get(this.idAttribute);
  }
});

var MyCollection = Deferred.Collection.extend({
  db: db,
  model: MyModel,
  sync: Db.sync,
  url: function() {
    return "/mymodels";
  }
});

describe('#Deferred call styles', function() {
  it('Should allow classic style', function(t) {
    var m = new MyModel({id:1});
    m.save(null, {success: function() {
      var ma = new MyModel({id:1});
      ma.fetch({
        success: function() {
          var col = new MyCollection();
          col.create({id:2, test_data:1}, {success: function() {
            var m = new MyModel({id:2});
            m.fetch({success:function() {
              assert(m.get('test_data') == 1);
              t();
            }});

          },error:assert})
        }, error: assert
      })
    },error: assert});

  });
  it('Should allow classic style with deferred', function(t) {
    var m = new MyModel({id:1});
    m.save().then(function() {
      var ma = new MyModel({id:1});
      ma.fetch().then(function() {
        t();
      }, function() {
        assert(false);
      });
    }, function() {
      assert(false);
    });
  });
  it('Should allow node.js style callbacks', function(t) {
    var m = new MyModel({id:1});
    m.save({kissa:"koira"}, function(err, res) {
      assert(err == null);
      assert(res != null);
      var m2 = new MyModel(m.toJSON());
      m2.fetch(function(err, res) {
        assert(err == null);
        assert(res != null);
        assert(m2.get("kissa") == "koira")
        t();
      });
    });
  });
});