var cSpeed=9;
var cWidth=28;
var cHeight=28;
var cTotalFrames=16;
var cFrameWidth=28;
var cImageSrc='images/sprites.png';

var cImageTimeout=false;

function startAnimation(){
	
	try {
		document.getElementById('spinner').innerHTML='<canvas id="canvas" width="'+cWidth+'" height="'+cHeight+'"><p>Your browser does not support the canvas element.</p></canvas>';
	} catch(err) {
		document.getElementById('spinner1').innerHTML='<canvas id="canvas" width="'+cWidth+'" height="'+cHeight+'"><p>Your browser does not support the canvas element.</p></canvas>';
	}
	//FPS = Math.round(100/(maxSpeed+2-speed));
	try {
	FPS = Math.round(100/cSpeed);
	SECONDS_BETWEEN_FRAMES = 1 / FPS;
	g_GameObjectManager = null;
	g_run=genImage;

	g_run.width=cTotalFrames*cFrameWidth;
	genImage.onload=function (){cImageTimeout=setTimeout(fun, 0)};
	initCanvas();
	} catch(err){
		console.log(err)
	}
}


function imageLoader(s, fun)//Pre-loads the sprites image
{
	try {
	clearTimeout(cImageTimeout);
	cImageTimeout=0;
	genImage = new Image();
	genImage.onload=function (){cImageTimeout=setTimeout(fun, 0)};
	genImage.onerror=new Function('alert(\'Could not load the image\')');
	genImage.src=s;
	console.log(genImage)
	} catch(err){
		console.log(err)
	}
}

//The following code starts the animation
new imageLoader(cImageSrc, 'startAnimation()');
