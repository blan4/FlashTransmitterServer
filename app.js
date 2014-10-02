#!/usr/bin/env node

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var plot = require('plotter').plot;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

server.listen(3000);

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/test', function(req, res) {
    var test = { '27': '0.0',
  '93': '0.0',
  '1605': '1494.0',
  '1697': '1564.0',
  '1909': '0.0',
  '2411': '1672.0',
  '2502': '1698.0',
  '2713': '0.0',
  '3217': '1789.0',
  '3308': '1765.0',
  '3521': '0.0',
  '4026': '1673.0',
  '4115': '1658.0',
  '4216': '1680.0',
  '4316': '1665.0',
  '4417': '919.0',
  '4631': '0.0',
  '5332': '1755.0',
  '5424': '1777.0',
  '5526': '1771.0',
  '5627': '1786.0',
  '5727': '1807.0',
  '5938': '0.0',
  '6643': '1608.0',
  '6732': '1687.0',
  '6834': '519.0',
  '7046': '0.0',
  '7137': '1.0',
  '7448': '1910.0',
  '7540': '1891.0',
  '7640': '1870.0',
  '7740': '1902.0',
  '7841': '2010.0',
  '8053': '1.0',
  '8646': '0.0',
  '8858': '2099.0',
  '9170': '1.0',
  '9553': '2.0' };
  var fileName = [generateUUID(),'.svg'].join('');
    plot({
      xlabel: 'timestamps',
      ylabel: 'lux',
      data: {'lux': test},
      style: 'linespoints',
      format: 'svg',
      filename: 'public/graphs/' + fileName,
      finish: function() {
          io.sockets.emit('graph', {'graph_url': '/graph/' + fileName, result: 'test'});
      }
  });
    res.sendStatus(200);
});

app.get('/graph/:name', function(req, res, next) {
    var options = {
        root: __dirname + '/public/graphs',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = req.params.name;
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName);
        }
    });
});

app.post('/graph', function(req, res) {
    console.log(req.body);
    var body = JSON.parse(Object.keys(req.body)[0]);

    var data = body.data;
    var result = body.result;
    var filtered = body.filteredData;
    if (data != undefined && filtered != undefined && result != undefined) {
        var fileName = [generateUUID(),'.svg'].join('');
        plot({
            xlabel: 'timestamps',
            ylabel: 'lux',
            data: {'lux': data, 'filtered': filtered},
            style: 'linespoints',
            format: 'svg',
            filename: 'public/graphs/' + fileName,
            finish: function() {
                io.sockets.emit('graph', {'graph_url': '/graph/' + fileName, result: result});
            }
        });
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

io.on('connection', function(socket) {
    socket.emit('news', {'hello': 'world'});
});