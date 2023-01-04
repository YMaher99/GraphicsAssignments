import * as THREE from 'https://cdn.skypack.dev/three@0.136';

import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );

const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

var difficulty = null;
var fruitSpeed = 0.05;

while(!difficulty){
	difficulty = prompt("Please enter the difficulty E/N/H", "N").toLowerCase();

	switch(difficulty){
		case "e":
			fruitSpeed = 0.02;
			break;
		case "n":
			fruitSpeed = 0.05;
			break;
		case "h":
			fruitSpeed = 0.13;
			break;
		default:
			fruitSpeed = 0.05;
			break;
	}
}

const gotFruitSound = new THREE.Audio(listener);
audioLoader.load("./got fruit.mp3", function(buffer){
	gotFruitSound.setBuffer(buffer);
	gotFruitSound.setLoop(false);
	gotFruitSound.setVolume(1.0);
	gotFruitSound.duration = 1.5;
});

const failureSound = new THREE.Audio(listener);
audioLoader.load("./failure.mp3", function(buffer){
	failureSound.setBuffer(buffer);
	failureSound.setLoop(false);
	failureSound.setVolume(1.0);

});

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
pointLight.position.set(0, 23, -6);
pointLight.castShadow = true;
scene.add(pointLight);

camera.position.z = 10;
camera.position.y = 15;

scene.background = new THREE.TextureLoader().load( "./background.jpg" );




var fruitExists = false;
var failures = 0;


var gui = new GUI();
var myObject = {
	Score: 0,
	Lives: 3
};


gui.add(myObject,'Score');
gui.add(myObject,"Lives");
gui.title("")



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

console.log(fruitSpeed)

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
		if(Math.random()>0.5){
			droppedCube.position.x = Math.random() * 30 ;
		}
		else{
			droppedCube.position.x = -Math.random() * 30;
		}
	}
	if(fruitExists){
		droppedCube.position.y -= fruitSpeed;
		if(isColliding(cube,droppedCube)){
			gotFruitSound.play()
			scene.remove(droppedCube);
			fruitExists = false;
			gui.controllers.forEach(element => {
				if(element.property == "Score"){
					element.setValue(element.getValue()+1)
				}
			});

		}
		if(droppedCube.position.y<0){
			failures+=1;
			scene.remove(droppedCube);
			fruitExists = false;
			failureSound.play()
			gui.controllers.forEach(element => {
				if(element.property == "Lives"){
					element.setValue(element.getValue()-1)
				}
			});
			if(failures>=3){
				alert("You lost!")
				location.reload()
			}
		}
	}




	renderer.render( scene, camera);
}
animate();