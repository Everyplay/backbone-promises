var assert = require('assert');
var Backbone = require('backbone');
var Model = require('../').Model;
var Collection = require('../').Collection;
var Db = require('backbone-db');
var debug = require('debug')('deferred');
var when = require('when');
var monitor = require('when/monitor/console');
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

describe('#Model', function() {
  it('should have chainable methods as promises', function(next) {
    var m = new MyModel();
    m.save({
      "test": 123
    }).then(function() {
      return m.save({
        "test_b": "a"
      }).then(function(mo) {
        var model = new MyModel({
          id: mo.get(mo.idAttribute)
        });
        return model.fetch();
      })
    }).done(function(m) {
      assert.equal(m.get("test_b"), "a");
      next();
    }, next)
  });

  it('should have deferred .save', function(t) {
    var m = new MyModel({
      id: 1
    });
    m.save().then(function() {
      t();
    }, t);
  });

  it('should have deferred .save and .fetch', function(t) {
    var m = new MyModel({
      id: 2,
      "test": "a"
    });
    m.save().then(function(a) {
      var m2 = new MyModel({
        id: 2
      });
      return m2.fetch().then(function(model) {
        assert(model.get("test") == "a");
      });
    }).done(function() {
      t();
    }, t);
  });

  it('Should maintain classic behaviour', function(t) {
    m = new MyModel({
      id: 3,
      "test": "a"
    });
    m.save({
      variable: "123"
    }, {
      success: function() {
        m2 = new MyModel({
          id: 3
        });
        m2.fetch({
          success: function() {
            assert.equal(m2.get("variable"), "123");
            assert.equal(m2.get("test"), "a")
            var maa = new MyModel({
              id: 123123
            });

            maa.fetch({
              success: function(asd) {
                assert(false, "success called while fetching non-existing key")
              },
              error: function(err) {
                t();
              }
            });
          },
          error: function(err) {
            assert.ok(false);
          }
        });
      }
    });
  });

  it('Should create empty model and accept variables in .save', function(t) {
    var m = new MyModel();
    m.save({
      id: 123
    }).done(function() {
      assert.equal(m.get("id"), 123);
      t();
    }, t);
  });

  it('Should be destroyable.', function(t) {
    var m = new MyModel();
    m.save({
      id: 123,
      asd: "asd"
    }).then(function() {
      assert.equal(m.get("id"), 123);
      return m.destroy().then(function() {
        return m.fetch().then(t,
          function(err) {
            assert(err instanceof(Error), 'It should return an error when not found');
            return when.resolve()
          });
      })
    }).done(function() {
      t();
    }, t);
  });

  it('Should reject .save() promise on failed validation', function(done) {
    var m = new MyModel();
    m.validate = function() {
      return new Error('failed validating');
    };
    m.save({
      id: 123,
      variable: "test"
    }).then(done, function(err) {
      assert.equal(err.message, 'failed validating');
      return when.resolve();
    }).done(done, function() {
      done();
    });
  });

  it('Should yield to promise in options if it exists', function(done) {
    var m = new MyModel();
    var m2 = new MyModel();
    var m3 = new MyModel();
    when.all(m.save(), m2.save(), m3.save()).then(function() {
      return m.fetch().then(function() {
        return m2.fetch().then(function() {
          return when.promise(function(resolve, reject) {
            m3.fetch().done(function() {
              setTimeout(function() {
                resolve();
              }, 1)
            }, reject);
          })
        });
      })
    }).done(function() {
      done();
    }, done);
  });
});