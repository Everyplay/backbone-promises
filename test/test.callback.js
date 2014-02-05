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
    debug('saving null options');
    m.save(null, {success: function() {
      debug('done');
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

          },error: t})
        }, error: t
      })
    },error: t});
  });
  it('Should allow classic style with Promises/A+', function(t) {
    var m = new MyModel({id:1});
    m.save().then(function() {
      var ma = new MyModel({id:1});
      return ma.fetch();
    }).done(function() {
      t();
    }, t);
  });
});