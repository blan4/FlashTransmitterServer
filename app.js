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
    console.log(data);
    console.log(result);
    if (data && result) {
        console.log(data);
        var fileName = [generateUUID(),'_', result.toString(), '.svg'].join('');
        plot({
            xlabel: 'timestamps',
            ylabel: 'lux',
            data: {'lux': data},
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