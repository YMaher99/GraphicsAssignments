// Import threejs and DAT GUI
import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';


// Create a new scene
const scene = new THREE.Scene();

// Create a Camera 
const camera = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );


// Create an AudioListener to play the audio and an AudioLoader to load the audio files
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

// Variables associated with difficulty
var difficulty = null;
var fruitSpeed = 0.05;

// Continuosuly Prompt the user for the difficulty they want
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


// Loading the fruit gotten sound
const gotFruitSound = new THREE.Audio(listener);
audioLoader.load("./got fruit.mp3", function(buffer){
	gotFruitSound.setBuffer(buffer);
	gotFruitSound.setLoop(false);
	gotFruitSound.setVolume(1.0);
	gotFruitSound.duration = 1.2;
});

// Loading the failure sound
const failureSound = new THREE.Audio(listener);
audioLoader.load("./failure.mp3", function(buffer){
	failureSound.setBuffer(buffer);
	failureSound.setLoop(false);
	failureSound.setVolume(1.0);
	failureSound.duration = 1.5;
});

// Add the listener to the camera
camera.add(listener);


// Create a renderer and add it to the HTML DOM
const renderer = new THREE.WebGLRenderer({alpha:true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Create the object the player controls to collect the fruit
var geometry = new THREE.BoxGeometry( 15, 1, 1 );
var material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );

scene.add( cube );

// Creating ambient light and adding it to the scene
const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);

// Creating a point light and adding it to the scene simulating the sun in the background image
const pointLight = new THREE.PointLight(0xffffff,15);
pointLight.position.set(0, 23, -6);
pointLight.castShadow = true;
scene.add(pointLight);

camera.position.z = 10;
camera.position.y = 15;

// Adding a background image to the scene
scene.background = new THREE.TextureLoader().load( "./background.jpg" );



// flag to indicate whether a fruit is in the scene or not
var fruitExists = false;

// number of times the player has failed to catch the fruit
var failures = 0;


// Adding a GUI
var gui = new GUI();

// Score and Lives values in the GUI 
var myObject = {
	Score: 0,
	Lives: 3
};

// Control Values in the GUI
var controlsObject = {
	Left: "A",
	Right: "D"
}

// Add the scores and lives to the GUI
gui.add(myObject,'Score');
gui.add(myObject,"Lives");

// Set GUI title to empty string
gui.title("")

// Add folder to GUI for controls
var controls = gui.addFolder("Controls")

// Add controls to the controls folder in the GUI
controls.add(controlsObject,"Left")
controls.add(controlsObject,"Right")

// Create an object for the fruit to be dropped
geometry = new THREE.BoxGeometry(1,1,1);
material = new THREE.MeshPhongMaterial({color:0xff0000});
const droppedCube = new THREE.Mesh(geometry, material); 


// Add an event listener for when a user presses keyboard buttons (i.e. controls for the game)
window.addEventListener('keydown', function (e) {
	if (e.key == 'D' || e.key == "d") {
	  cube.position.x += 1;
	}

	if(e.key == "A" || e.key == "a"){
		cube.position.x -=1;
	}

});


// Function to check the collision between two objects (will be used to check collision between the player object and the fruit)
function isColliding(obj1, obj2) {
	if (obj1) {
	  if (obj2) {
		return Math.abs(obj1.position.y - obj2.position.y) < 1 && Math.abs(obj1.position.x - obj2.position.x) < 8;
	  }
	}
  }


// Animation function that plays every frame
function animate() {
	// Requests that the animate function is called next frame
	requestAnimationFrame( animate );

	// If the fruit is not in the scene add it to the scene at a random x position and from a certain height
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

	// if the fruit does exist drop it y-position by a speed depending on the difficulty
	}
	if(fruitExists){
		droppedCube.position.y -= fruitSpeed;

		// Check if the fruit has collided with the player object, if it did play the getting fruit sound remove the fruit from the scene unset the fruitExists flag and and 1 to the score
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

		// If the fruit reaches y < 0 then consider the player failed to catch the fruit add 1 to failures, decrease player lives, play failure sound, and decrease player's lives
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

			// If player failed three times then Game over, alert the user, and refresh
			if(failures>=3){
				alert("You lost!")
				location.reload()
			}
		}
	}



	// Renderer renders the scene from the camera's perspective
	renderer.render( scene, camera);
}

// Calling the animate function for the first time
animate();