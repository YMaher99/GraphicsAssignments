import * as THREE from 'https://cdn.skypack.dev/three@0.136';

import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();
var score = 0;

const camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 15, 1, 1 );
var material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );

scene.add( cube );

const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);

const pointLight = new THREE.PointLight(0xffffff,15);
pointLight.position.set(0, 20, -3);
pointLight.castShadow = true;
scene.add(pointLight);

camera.position.z = 10;
camera.position.y = 15;

scene.background = new THREE.TextureLoader().load( "./background.jpg" );

var fruitExists = false;



var gui = new GUI();
var myObject = {
	Score: 0,
};


gui.add(myObject,'Score');
gui.title("SCORE")



geometry = new THREE.BoxGeometry(1,1,1);
material = new THREE.MeshPhongMaterial({color:0xff0000});
const droppedCube = new THREE.Mesh(geometry, material); 
window.addEventListener('keydown', function (e) {
	if (e.key == 'D' || e.key == "d") {
	  cube.position.x += 1;
	}

	if(e.key == "A" || e.key == "a"){
		cube.position.x -=1;
	}

});



function isColliding(obj1, obj2) {
	if (obj1) {
	  if (obj2) {
		return Math.abs(obj1.position.y - obj2.position.y) < 1 && Math.abs(obj1.position.x - obj2.position.x) < 8;
	  }
	}
  }

console.log(window.innerWidth);

function animate() {
	requestAnimationFrame( animate );


	if (!fruitExists){
		fruitExists = true;
		scene.add(droppedCube);
		droppedCube.position.y=30;
		droppedCube.position.x = Math.random() * 30 ;

	}
	if(fruitExists){
		droppedCube.position.y -=0.05;
		if(isColliding(cube,droppedCube)){
			score +=1
			console.log(score);
			scene.remove(droppedCube);
			fruitExists = false;
			gui.controllers.forEach(element => {
				element.setValue(element.getValue() + 1)
			});

		}
		if(droppedCube.position.y<0){
			console.log("fell");
			scene.remove(droppedCube);
			fruitExists = false;
		}
	}




	renderer.render( scene, camera);
}
animate();