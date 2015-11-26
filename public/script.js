var gl = null;
var prg = null; 
var c_width = 0; 
var c_height = 0; 

var coneVertexBuffer = null;
var coneIndexBuffer = null; 
var coneNormalBuffer = null;

var indices = [];
var vertices = [];
var colors = [];
var phong = true;
var colorMap = [
    [1   ,0.8 ,0.8 ,0.8 ],  //0 skin
    [0.5 ,1   ,0.5 ,0.8 ],  //1 green
    [0   ,1   ,1   ,0.8 ],  //2 cyan
    [0.6 ,0.6 ,1   ,0.8 ],  //3 
    [1   ,0   ,0.5 ,0.8 ],  //4 red
    [1   ,0.8 ,0.8 ,0.8 ],  //0 skin  
    [0.5 ,1   ,0   ,0.8 ],  //6 green 
    [0.5 ,0   ,1   ,0.8 ],  //7 
    [0   ,0.5 ,1   ,0.8 ],  //8 blue
    [1   ,0.65,0   ,0.8 ],  //9 orange  
];
var normals = [];
var normalObj = [];
var models = [];
var mvMatrix = mat4.create();
var pMatrix = mat4.create(); 
var nMatrix = mat4.create();
var camera = null;
var interactor = null;
function initProgram() {
    var fgShader = utils.getShader(gl, 'shader-fs');
    var vxShader = utils.getShader(gl, 'shader-vs');

    prg = gl.createProgram();
    gl.attachShader(prg, vxShader);
    gl.attachShader(prg, fgShader);
    gl.linkProgram(prg);

    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        alert('Could not initialise shaders');
    }

    gl.useProgram(prg);

    prg.aVertexPosition   = gl.getAttribLocation(prg, 'aVertexPosition');
    prg.pMatrixUniform    = gl.getUniformLocation(prg, 'uPMatrix');
    prg.mvMatrixUniform   = gl.getUniformLocation(prg, 'uMVMatrix');
    prg.aVertexNormal     = gl.getAttribLocation(prg, 'aVertexNormal');
    prg.aVertexColor      = gl.getAttribLocation(prg, 'aVertexColor');
    prg.uNMatrix          = gl.getUniformLocation(prg, "uNMatrix");

    prg.uMaterialDiffuse  = gl.getUniformLocation(prg, "uMaterialDiffuse");
    prg.uLightAmbient     = gl.getUniformLocation(prg, "uLightAmbient");
    prg.uLightDiffuse     = gl.getUniformLocation(prg, "uLightDiffuse");
    prg.uLightPosition    = gl.getUniformLocation(prg, "uLightPosition");
    prg.uWireframe        = gl.getUniformLocation(prg, "uWireframe");
    prg.uPerVertexColor   = gl.getUniformLocation(prg, "uPerVertexColor");
    prg.uTransparency     = gl.getUniformLocation(prg, "uTransparency");
    prg.uShininess        = gl.getUniformLocation(prg, "uShininess");
    prg.uPhong            = gl.getUniformLocation(prg, "uPhong");

    gl.uniform3fv(prg.uLightPosition,    [0, 120, 120]);
    gl.uniform4fv(prg.uLightAmbient,      [0.20,0.20,0.20,0.0]);
    gl.uniform4fv(prg.uLightDiffuse,      [1.0,1.0,1.0,0.0]); 


    gl.uniform4fv(prg.uMaterialAmbient, [1.0,1.0,1.0,0.0]); 
    gl.uniform4fv(prg.uMaterialDiffuse, [0.6,0.5,0.5,0.0]);
    gl.uniform4fv(prg.uMaterialSpecular,[1.0,1.0,1.0,0.0]);
    gl.uniform1f(prg.uShininess, 230.0);
    gl.uniform1f(prg.uTransparency, 0.5);
    gl.uniform1f(prg.uPhong, 1.0);
}

function initBuffers() {

    // vertices =[1.5, 0, 0, 
    // 	       -1.5, 1, 0, 
    // 	       -1.5, 0.809017,0.587785,
    // 	       -1.5, 0.309017,0.951057, 
    // 	       -1.5, -0.309017, 0.951057, 
    // 	       -1.5, -0.809017, 0.587785,
    // 	       -1.5, -1, 0, 
    // 	       -1.5, -0.809017, -0.587785,
    // 	       -1.5, -0.309017, -0.951057, 
    // 	       -1.5, 0.309017,-0.951057, 
    // 	       -1.5, 0.809017,-0.587785];

    // indices = [0, 1, 2,
    // 	       0, 2, 3,
    // 	       0, 3, 4,
    // 	       0, 4, 5,
    // 	       0, 5, 6,
    // 	       0, 6, 7,
    // 	       0, 7, 8,
    // 	       0, 8, 9,
    // 	       0, 9, 10,
    // 	       0, 10, 1];

    coneVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    coneNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coneNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
    coneIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    coneColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coneColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

}

function draw(){
    try {
	gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
	gl.vertexAttribPointer(prg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prg.aVertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, coneNormalBuffer);
        gl.vertexAttribPointer(prg.aVertexNormal,3,gl.FLOAT, false, 0,0);
	gl.enableVertexAttribArray(prg.aVertexNormal);

	gl.bindBuffer(gl.ARRAY_BUFFER, coneColorBuffer);
	gl.vertexAttribPointer(prg.aVertexColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prg.aVertexColor);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT,0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
    }
    catch (err) {
	alert(err);
        console.error(err.description);
    }
}

function renderLoop() {
    gl.viewport(0, 0, c_width, c_height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
//    gl.depthMask(false);
    gl.blendEquation( gl.FUNC_ADD );
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    updateTransforms();   
    setMatrixUniforms()
    mvMatrix = camera.getViewTransform()
    models.sort (function (a, b) {
    	var z = function (model) {
    	    return Math.min.apply (this, model.vertices.map (function (vertex) {
    		var ver = vec3.create();
    		mat4.multiplyVec3(mvMatrix, vertex, ver);
    		return ver[2];
    	    }));
    	};
    	var za = z(a);
    	var zb = z(b);
    	if (za > zb) {
    	    return 1;
    	}
    	if (za < zb) {
    	    return -1;
    	}
    	return 0;
    });

    for (var i = 0; i < models.length; i++) {
	if (!models[i].display)
	    continue;
	vertices = Array.prototype.concat.apply([], models[i].vertices);
	indices = Array.prototype.concat.apply([], models[i].faces);
	colors = Array.prototype.concat.apply([], models[i].colors);
	normals = Array.prototype.concat.apply([], models[i].normals);

	if (i == 0) {
	    coneVertexBuffer = gl.createBuffer();
	    coneNormalBuffer = gl.createBuffer();
	    coneIndexBuffer = gl.createBuffer();
	    coneColorBuffer = gl.createBuffer();
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, coneNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, coneColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ARRAY_BUFFER,null);
	
	draw();
    }
}

function initTransforms(){
    mvMatrix = camera.getViewTransform();
    mat4.identity(pMatrix);
    mat4.perspective(45, c_width / c_height, 0.1, 5000.0, pMatrix);
    mat4.identity(nMatrix);
    mat4.set(mvMatrix, nMatrix);
    mat4.inverse(nMatrix);
    mat4.transpose(nMatrix);
 }

function updateTransforms(){
    mat4.perspective(45, c_width / c_height, 0.1, 5000.0, pMatrix); 
}

function setMatrixUniforms(){
    gl.uniformMatrix4fv(prg.mvMatrixUniform, false, camera.getViewTransform());  
    gl.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);   
    mat4.transpose(camera.matrix, nMatrix);             
    gl.uniformMatrix4fv(prg.uNMatrix, false, nMatrix);  
}


function configure() {
    gl.enable(gl.DEPTH_TEST);
    var midx = vertices.filter(function (a, index) {
	return index % 3 == 0;
    }).reduce(function(a, b) {
	return a + b; 
    }, 0) / (vertices.length / 3);

    var midy = vertices.filter(function (a, index) {
	return index % 3 == 1;
    }).reduce(function(a, b) {
	return a + b; 
    }, 0) / (vertices.length / 3);

    var midz = vertices.filter(function (a, index) {
	return index % 3 == 2;
    }).reduce(function(a, b) {
	return a + b; 
    }, 0) / (vertices.length / 3);
    
    vertices = vertices.map (function (a, index) {
	if (index % 3 == 0) {
	    return a - midx;
	}
	else if (index % 3 == 1) {
	    return a - midy;
	}
	else {
	    return a -midz;
	}
    });

    var maxx = vertices.filter(function (a, index) {
	return index % 3 == 0;
    }).reduce(function(a, b) {
	if (b > a) {
	    return b;
	}
	else {
	    return a;
	}	    
    }, 0);

    var maxy = vertices.filter(function (a, index) {
	return index % 3 == 1;
    }).reduce(function(a, b) {
	if (b > a) {
	    return b;
	}
	else {
	    return a;
	}
    }, 0);

    var maxz = vertices.filter(function (a, index) {
	return index % 3 == 2;
    }).reduce(function(a, b) {
	if (b > a) {
	    return b;
	}
	else {
	    return a;
	}
    }, 0);


    camera = new Camera(CAMERA_ORBIT_TYPE);
    var max = Math.max.apply(null, [maxx, maxy, maxz]);
    camera.goHome([0, 0, max * 4]);
    camera.hookRenderer = renderLoop;

    for (var i = 0; i < models.length; i++) {
	models[i].vertices = models[i].vertices.map (function (a) {
	    return [a[0] - midx, a[1] - midy, a[2] - midz];
	});
    }
    
    var canvas = document.getElementById('canvas-element-id');
    interactor = new CameraInteractor(camera, canvas);
    
    gl.uniform4fv(prg.uLightAmbient,      [0.1,0.1,0.1,0]);
    gl.uniform3fv(prg.uLightPosition,    [0, 0, 2120]);
    gl.uniform4fv(prg.uLightDiffuse,      [0.7,0.7,0.7,0.0]);


    $("#slider1").change();
    initTransforms();
}

function calculateNormals(model) {
    var indices = model.faces;
    var vertices = model.vertices;
    vertices = Array.prototype.concat.apply([], vertices);
    indices = Array.prototype.concat.apply([], indices);
    var normalObj = [];
    var normals = [];
    for (var i = 0; i < indices.length; i = i + 3) {
	var first = 
	    [vertices[3*indices[i]], vertices[3*indices[i]+1], vertices[3*indices[i]+2]];
	var second = 
	    [vertices[3*indices[i+1]], vertices[3*indices[i+1]+1], vertices[3*indices[i+1]+2]];
	var third = 
	    [vertices[3*indices[i+2]], vertices[3*indices[i+2]+1], vertices[3*indices[i+2]+2]];

	var sideOne = [second[0] - first[0], second[1] - first[1], second[2] - first[2]];
	var sideTwo = [first[0] - third[0], first[1] - third[1], first[2] - third[2]];
	var normal = vec3.cross(sideOne, sideTwo);
	if (normalObj[indices[i]] == undefined) {
	    normalObj[indices[i]] = [normal];
	}
	else {
	    normalObj[indices[i]].push(normal);
	}
    }

    for (var i = 0; i < vertices.length / 3; i++) {
	normals[i] = [0, 0, 0];
	if (normalObj[i]) {
	    for (j = 0; j < normalObj[i].length; j++) {
		normals[i][0] += normalObj[i][j][0];
		normals[i][1] += normalObj[i][j][1];
		normals[i][2] += normalObj[i][j][2];
	    }
	    normals[i][0] /= normalObj[i].length;
	    normals[i][1] /= normalObj[i].length;
	    normals[i][2] /= normalObj[i].length;
	}
    }
    model.normals = normals;
}
function makeSidebar() {
    var clusters = models.map(function(model) { 
	return model.dir;
    })
    .reduce (function (prev, current, index, array) {
	if (prev.indexOf (current) == -1)
	    return prev.concat(current);
	else return prev;
    }, []);
    clusters.forEach(function(cluster) {
	$("<li><input type=\"checkbox\" value=\"" + cluster + "\" checked=\"true\" \"><label>"
	  +cluster + "</label></input></li>")
	    .appendTo($("#clusters"));
    });
    $("#clusters input").change(function() {
	var dir = $(this).val();
	models.filter(function(model) { return model.dir == dir }).forEach(function(model) {
	    model.display = !model.display;
	});
	renderLoop();
    });
    $("#slider1").change(function() {
	gl.uniform1f(prg.uTransparency, $(this).val());
	renderLoop();
    });
    $("#phong").change(function() {
	phong = !phong;
	gl.uniform1f(prg.uPhong, phong ? 1.0 : 0.0);
	renderLoop();
    });
    $.ajax({
       type: "GET",
        url: "/dirs",
        timeout: 20000,
        contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
        success: function(data) { 
	    var dirs = JSON.parse(data);
	    dirs.forEach (function(dir) {
		var el = $("<li><a='anoop'>" + dir + "</a></li>");
		el.appendTo($("#emds"));
		el.click(function() { 
		    $("#clusters").html("");
		    $("#emds").html("");
		    start(dir); 
		    return false; 
		});
	    });
	    
	}
    });

    $("#button").click(function() {
	start("/VTK0");
    });
    
}
function start(vtk) {
    vtk = vtk || "/vtk";
    gl = utils.getGLContext('canvas-element-id');
    initProgram();
    $.ajax({
       type: "GET",
        url: vtk,
        timeout: 20000,
        contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
        success: function(data) { 
	    models = JSON.parse(data);
	    var faceIndex = 0;
	    for (var i = 0; i < models.length; i++) {
		vertices = vertices.concat(models[i].vertices);
		var fill = Array.apply(null, Array(models[i].vertices.length))
		    .map(function(){return colorMap[models[i].color];});
		models[i].colors = fill;
//		colors = colors.concat(fill);
		indices = indices.concat(models[i].faces.map(function(face) {
		     return [face[0] + faceIndex, face[1] + faceIndex, face[2] + faceIndex];
		}));
		calculateNormals(models[i]);
		normals = normals.concat(models[i].normals);
		faceIndex += models[i].vertices.length;
		models[i].display = true;
	    }
	    vertices = Array.prototype.concat.apply([], vertices);
	    // indices = Array.prototype.concat.apply([], indices);
	    // colors = Array.prototype.concat.apply([], colors);
	    // normals = Array.prototype.concat.apply([], normals);
	    makeSidebar();
	    configure();
	    renderLoop();
	}
    });  
}
