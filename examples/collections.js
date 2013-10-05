var Model = require('../').Model;
var Db = require('backbone-db');
var Promises = require('../');
var MyModel = require('./model');
var MyCollection = Promises.Collection.extend({
  model: MyModel,
  url: function() {
    if(this.isNew()) {
      return '/mymodels';
    } else {
      return '/mymodels/'+this.get(this.idAttribute);
    }
  }
});
var a = new MyCollection();
var m1 = a.create({id:1,data:"xyz"});
var m2 = a.create({id:2,data:"zyx"});
var m3 = a.create({id:3,data:""});
Promises.when.join(m1,m2,m3).then(function(values) {
  console.log("Models created",values);
}, console.error.bind(console));