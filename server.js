var express = require('express');
var app = express();
var fs = require ('fs');

app.get('/', function(req, res, next) {
    fs.readFile("public/main.html", 'utf8', function(err, data) {
	res.send(data);
    });
});
app.get('/vtk', function(req, res, next) {
    fs.readdir("public/VTK/",function(err, dirs) {
	dirs = dirs.filter(function(dir) {
	    return (fs.lstatSync("public/VTK/"+dir).isDirectory() && dir.toString() != "others");
	});
	for (i = 0; i < dirs.length; i++) {
	    files = fs.readdirSync("public/VTK/" + dirs[i] + "/");
	    var data = fs.readFileSync("public/VTK/" + dirs[i] + "/" + files[0], 'utf8');
	    console.log(parseVTK(data));
	}
	res.end();
    });
});
app.get('/:name', function(req, res, next) {
    var vertices = [];
    var faces = [];
    if (req.params.name.match(/\.vtk$/)) {
	fs.readFile("public/" + req.params.name, 'utf8', function (err, data) {
	    var vtkData = parseVTK(data);
	    vertices = vtkData.vertices;
	    faces = vtkData.faces;
	    res.send([{vertices : vertices, faces : faces}]);
	});
    }
    else {
	next();
    }
}).use('/', express.static('public'))


var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Computer Graphics Project running at port 3000...');
});

function parseVTK(data) {
    var vertices = [];
    var faces = [];
    function vertex(x, y, z) {
	vertices.push([x, y, z]);
    }
    function face(a, b, c) {
	faces.push([a, b, c]);
    }
    var pattern, result;
    var datas = data.split("POLYGONS");
    var vpart = datas[0];
    var fpart = datas[1];
    pattern = /([\+|\-]?[\d]+(?:[\.][\d|\-|e]+)?)[ ]+([\+|\-]?[\d]+(?:[\.][\d|\-|e]+)?)[ ]+([\+|\-]?[\d]+(?:[\.][\d|\-|e]+)?)/g;
    
    while((result = pattern.exec(vpart)) != null) {
	vertex(parseFloat(result[1]),
	       parseFloat(result[2]),
	       parseFloat(result[3]));
    }
    pattern = /\n3[ ]+([\d]+)[ ]+([\d]+)[ ]+([\d]+)/g;
    while((result = pattern.exec(fpart)) != null) {
	face(parseInt(result[1]), parseInt(result[2]), parseInt(result[3]));
    }
    return {vertices : vertices, faces : faces};
}
