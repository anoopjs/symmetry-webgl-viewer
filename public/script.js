var gl = null;
var prg = null; 
var c_width = 0; 
var c_height = 0; 

var coneVertexBuffer = null;
var coneIndexBuffer = null; 
var coneNormalBuffer = null;

var indices = [];
var vertices = [];
var normals = [];
var normalObj = [];

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

    prg.aVertexPosition = gl.getAttribLocation(prg, 'aVertexPosition');
    prg.pMatrixUniform          = gl.getUniformLocation(prg, 'uPMatrix');
    prg.mvMatrixUniform         = gl.getUniformLocation(prg, 'uMVMatrix');
    prg.aVertexNormal   = gl.getAttribLocation(prg, 'aVertexNormal');
    prg.uNMatrix           = gl.getUniformLocation(prg, "uNMatrix");

    prg.uMaterialDiffuse  = gl.getUniformLocation(prg, "uMaterialDiffuse");
    prg.uLightAmbient     = gl.getUniformLocation(prg, "uLightAmbient");
    prg.uLightDiffuse     = gl.getUniformLocation(prg, "uLightDiffuse");
    prg.uLightPosition    = gl.getUniformLocation(prg, "uLightPosition");
    prg.uWireframe        = gl.getUniformLocation(prg, "uWireframe");
    prg.uPerVertexColor   = gl.getUniformLocation(prg, "uPerVertexColor");

    prg.uShininess         = gl.getUniformLocation(prg, "uShininess");

    gl.uniform3fv(prg.uLightPosition,    [0, 120, 120]);
    gl.uniform4fv(prg.uLightAmbient,      [0.20,0.20,0.20,1.0]);
    gl.uniform4fv(prg.uLightDiffuse,      [1.0,1.0,1.0,1.0]); 


    gl.uniform4fv(prg.uMaterialAmbient, [1.0,1.0,1.0,1.0]); 
    gl.uniform4fv(prg.uMaterialDiffuse, [0.5,0.5,0.5,1.0]);
    gl.uniform4fv(prg.uMaterialSpecular,[1.0,1.0,1.0,1.0]);

    gl.uniform1f(prg.uShininess, 230.0);


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
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

}

function draw(){
    gl.viewport(0, 0, c_width, c_height);
//    gl.clearColor(0.3,0,0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    try {
	updateTransforms();   
	setMatrixUniforms()

	gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
	gl.vertexAttribPointer(prg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prg.aVertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, coneNormalBuffer);
        gl.vertexAttribPointer(prg.aVertexNormal,3,gl.FLOAT, false, 0,0);
	gl.enableVertexAttribArray(prg.aVertexNormal);

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
//    requestAnimFrame(renderLoop);
    draw();
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
//    gl.clearColor(0.3,0,0.3, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

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


    for (i = 0; i < indices.length; i = i + 3) {
	var first = 
	    [vertices[3*indices[i]], vertices[3*indices[i]+1], vertices[3*indices[i]+2]];
	var second = 
	    [vertices[3*indices[i+1]], vertices[3*indices[i+1]+1], vertices[3*indices[i+1]+2]];
	var third = 
	    [vertices[3*indices[i+2]], vertices[3*indices[i+2]+1], vertices[3*indices[i+2]+2]];

	var sideOne = [second[0] - first[0], second[1] - first[1], second[2] - first[2]];
//	var sideOne = [first[0] - second[0], first[1] - second[1], first[2] - second[2]];
	var sideTwo = [first[0] - third[0], first[1] - third[1], first[2] - third[2]];
	var normal = vec3.cross(sideOne, sideTwo);
	if (normalObj[indices[i]] == undefined) {
	    normalObj[indices[i]] = [normal];
	}
	else {
	    normalObj[indices[i]].push(normal);
	}
    }

    for (i = 0; i < normalObj.length; i++) {
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

    normals = Array.prototype.concat.apply([], normals);
    camera = new Camera(CAMERA_ORBIT_TYPE);
    var max = Math.max.apply(null, [maxx, maxy, maxz]);
    camera.goHome([0, 0, max * 4]);

    camera.hookRenderer = draw;
    
    var canvas = document.getElementById('canvas-element-id');
    interactor = new CameraInteractor(camera, canvas);
    
    gl.uniform4fv(prg.uLightAmbient,      [0.1,0.1,0.1,1.0]);
    gl.uniform3fv(prg.uLightPosition,    [0, 0, 2120]);
    gl.uniform4fv(prg.uLightDiffuse,      [0.7,0.7,0.7,1.0]);

    initTransforms();
}

function start() {
    gl = utils.getGLContext('canvas-element-id');
    initProgram();
    $.ajax({
       type: "GET",
        url: "/vtk",
        timeout: 20000,
        contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
        success: function(data) { 
	    data = data[0];
	    vertices = Array.prototype.concat.apply([], data.vertices);
	    indices = Array.prototype.concat.apply([], data.faces);
	    configure();
	    initBuffers();
	    renderLoop();
	}
    });  
}
