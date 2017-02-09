var express = require('express');
var router = express.Router();
var mongo = require('mongodb'),
    Server = mongo.Server,
    DB = mongo.Db,
    ObjectId = mongo.ObjectId;

var staticPassword = '1234567890';

var db = new DB('doctorleus', new Server('localhost', 27017));


var validate = function(res, password, callback) {
    if(password === staticPassword) { 
        callback();
    } else {
        res.status(403);
        res.send('You are not allowed to do that');
    }
};

/* GET API. */
router.get('/', function(req, res, next) {
  res.send('API');
});

/* GET Dentist Services */
router.get('/dentist/services', function(req, res, next) {
    db.open(function(error, db) {
        db.collection('services', function(error, services) {
            services.find({$query: {type: "dentist"}, $orderby: {$natural : -1} }).toArray(function(error, services) {
                res.json(services);
            });
        });

        db.close();
    });
});

/* GET Cosmetics Services */
router.get('/cosmetics/services', function(req, res, next) {
    db.open(function(error, db) {
        db.collection('services', function(error, services) {
            services.find({$query: {type: "cosmetics"}, $orderby: {$natural : -1} }).toArray(function(error, services) {
                res.json(services);
            });
        });

        db.close();
    });
});

/* Update Service by id */
router.put('/services/:id', function(req, res, next) {
    var id = new ObjectId(req.params.id);
    var data = req.body;

    validate(res, data.password, function() {
        delete data.password

        db.open(function(error, db) {
            db.collection('services', function(error, services) {
                services.update({_id: id}, {
                    '$set': { 
                        price: data.price,
                        description: data.description
                    }
                }, function(error, service) {
                    res.send(200)
                });
            });

            db.close();
        });
    });
});

/* Insert new Service */
router.post('/service', function(req, res, next) {
    var data = req.body;

    validate(res, data.password, function() {
        delete data.password

        db.open(function(error, db) {
            console.log(data)
            db.collection('services', function(error, services) {
                services.save(data, {w:1}, function(err, data) {
                    if (err) {
                        res.send(err)
                    } else {
                        res.send(200);
                    }
                });
            });

            db.close();
        });
    });
});

/* Delete service by id*/
router.delete('/services/:id', function(req, res, next) {
    var id = new ObjectId(req.params.id);
    var data = req.body;

    validate(res, data.password, function() {
        delete data.password

        if(id) {
            db.open(function(error, db) {
                db.collection('services', function(error, services) {
                    var result = services.remove({_id: id});

                    res.json(200);
                });

                db.close();
            });
        }
    });
});


module.exports = router;
