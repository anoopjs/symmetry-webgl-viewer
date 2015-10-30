var gl = null;
var prg = null; 
var c_width = 0; 
var c_height = 0; 

var coneVertexBuffer = null;
var coneIndexBuffer = null; 

var indices = [];
var vertices = [];

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
    // prg.uMaterialDiffuse  = gl.getUniformLocation(prg, "uMaterialDiffuse");
    // prg.uLightAmbient     = gl.getUniformLocation(prg, "uLightAmbient");
    // prg.uLightDiffuse     = gl.getUniformLocation(prg, "uLightDiffuse");
    // prg.uLightPosition    = gl.getUniformLocation(prg, "uLightPosition");
    // prg.uUpdateLight      = gl.getUniformLocation(prg, "uUpdateLight");
    // prg.uWireframe        = gl.getUniformLocation(prg, "uWireframe");
    // prg.uPerVertexColor   = gl.getUniformLocation(prg, "uPerVertexColor");


    // gl.uniform3fv(prg.uLightPosition,    [0, 120, 120]);
    // gl.uniform4fv(prg.uLightAmbient,      [0.20,0.20,0.20,1.0]);
    // gl.uniform4fv(prg.uLightDiffuse,      [1.0,1.0,1.0,1.0]); 

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
    
    
    coneIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER,null);

}

function draw(){
    gl.viewport(0, 0, c_width, c_height);
    gl.clearColor(0.3,0.3,0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    try {
	updateTransforms();   
//	setMatrixUniforms(); 

	gl.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(prg.mvMatrixUniform, false, camera.getViewTransform());

	gl.bindBuffer(gl.ARRAY_BUFFER, coneVertexBuffer);
	gl.vertexAttribPointer(prg.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(prg.aVertexPosition);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, coneIndexBuffer);
	gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT,0);
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
    
    // mat4.identity(mvMatrix);
    // mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);

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
    
    gl.uniformMatrix4fv(prg.uMVMatrix, false, camera.getViewTransform());  
    console.log(camera.getViewTransform());
    gl.uniformMatrix4fv(prg.uPMatrix, false, pMatrix);   
    mat4.transpose(camera.matrix, nMatrix);             
    gl.uniformMatrix4fv(prg.uNMatrix, false, nMatrix);  
//    displayMatrix(camera.matrix);
}


function configure() {
    gl.clearColor(0.3,0.3,0.3, 1.0);
    gl.clearDepth(100.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    
    camera = new Camera(CAMERA_ORBIT_TYPE);
    camera.goHome([0,0,300.0,300.0]);
    camera.hookRenderer = draw;
    
    var canvas = document.getElementById('canvas-element-id');
    interactor = new CameraInteractor(camera, canvas);
    
    // gl.uniform4fv(prg.uLightAmbient,      [0.1,0.1,0.1,1.0]);
    // gl.uniform3fv(prg.uLightPosition,    [0, 0, 2120]);
    // gl.uniform4fv(prg.uLightDiffuse,      [0.7,0.7,0.7,1.0]);

    initTransforms();
}


function displayMatrix(m){
    var selector = '';
    for(var i=0;i<16;i++){
        selector = '#m'+i;
        $(selector).html(m[i].toFixed(1));
    }
}


function start() {
    gl = utils.getGLContext('canvas-element-id');
    initProgram();
    configure();
    $.ajax({
       type: "GET",
        url: "0-1.vtk",
        timeout: 20000,
        contentType: "application/x-www-form-urlencoded;charset=ISO-8859-15",
        success: function(data) { 
	    vertices = Array.prototype.concat.apply([], data.vertices);
	    indices = Array.prototype.concat.apply([], data.faces);
	    initBuffers();
	    renderLoop();
	}
    });  
}
