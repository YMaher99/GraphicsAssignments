// Import threejs, DAT GUI, and Orbit Controls
import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
const scene = new THREE.Scene();

// Camera Variables (16:9 aspect Ratio)
var width = 40
var height = 22.5
var near = 0.1
var far = 100

// timer for snake movement (Snake moves once each 50 frames or whenever player uses controlls)
var timer = 0;

// Create an orthographic camera with previously initialized camera variables
var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, near, far );

// Create an AudioListener to play the audio and an AudioLoader to load the audio files
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

// Loading the eat sound
const eatingSound = new THREE.Audio(listener);
audioLoader.load("./eating.mp3", function(buffer){
	eatingSound.setBuffer(buffer);
	eatingSound.setLoop(false);
	eatingSound.setVolume(1.0);
});

// Loading the defeat sound
const defeatSound = new THREE.Audio(listener);
audioLoader.load("./defeat.mp3",function(buffer){
	defeatSound.setBuffer(buffer);
	defeatSound.setLoop(false);
	defeatSound.setVolume(1.0);
});

// Add the listener to the camera
camera.add(listener);

// Create a renderer and add it to the HTML DOM
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Creating ambient light and adding it to the scene
const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);


// Setting the position of the camera and rotating it to look at the grid
camera.position.set(0,0,-10);
camera.rotateZ(-Math.PI/2)

// Loading a texture for the mesh
var texture = new THREE.TextureLoader().load( "./grass.jpg" )

// Create a plane mesh with the texture loaded previously, and of size (20,20). Then add to scene
const planeMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(20,20),
	new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		visible: true,
		map: texture
	})
);

scene.add(planeMesh);

// Create new (20,20) grid and add it to scene
const grid = new THREE.GridHelper(20,20);
grid.rotateX(-Math.PI/2)

// Adding a GUI
var gui = new GUI();

// Score value in the GUI 
var myObject = {
	Score: 0,
};

// Control Values in the GUI
var controls = {
	Up: "W",
	Left: "A",
	Down: "S",
	Right:"D"
}

// Set GUI title to empty string
gui.title("")

// Add the score to the GUI
gui.add(myObject,'Score')	

// Add folder to GUI for controls
var controls_folder = gui.addFolder("Controls")

// Add controls to the controls folder in the GUI
controls_folder.add(controls, "Up")
controls_folder.add(controls,"Left")
controls_folder.add(controls,"Down")
controls_folder.add(controls,"Right")

// Create a vector to represent the snake head's movement (Initially moving to the right)
var movement_vector = new THREE.Vector3(-1,0,0)

// Create a box to represent the snake's head and add it to the scene
var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshPhongMaterial( { color: 0x000000 } );
const snakeHead = new THREE.Mesh( geometry, material );
snakeHead.position.set(0.5,0.5,0)
scene.add(snakeHead)

// Create an array of boxes to represent the snake's body 
var snakeBody = [snakeHead]

// Add an event listener for when a user presses keyboard buttons (i.e. controls for the game)
// Whenever the player presses a directional control button in addition to moving the snake in that direction
// The Movement vector is set to that direction to move the snake head in this direction automatically
window.addEventListener('keydown', function (e) {

		if (e.key == 'D' || e.key == "d") {
			snakeHead.position.x -= 1;
			movement_vector.set(-1,0,0);
		}

		if(e.key == "A" || e.key == "a"){
			snakeHead.position.x +=1;
			movement_vector.set(1,0,0);

		}

		if (e.key == 'S' || e.key == "s") {
			snakeHead.position.y -= 1;
			movement_vector.set(0,-1,0);

		}
	
		if(e.key == "W" || e.key == "w"){
			snakeHead.position.y +=1;
			movement_vector.set(0,1,0);

		}

		// If the snake's body is bigger than 1 box whenever the player moves the snake move the rest of the body
		if(snakeBody.length>1){
			for (var i = snakeBody.length - 1; i>=1;i--){
				snakeBody[i].position.set(snakeBody[i-1].position.x,snakeBody[i-1].position.y,snakeBody[i-1].position.z);
			}
		}

		// If there is a fruit in the scene
		if(fruitExists){
			
			// Check if the snake's head is colliding with the fruit
			if(isColliding(snakeHead,fruit)){
				
				// Add another box to the snakeBody array and add the box to the scene
				snakeBody.push(new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:0x60b922}) ));
				scene.add(snakeBody[snakeBody.length-1]);

				// Play the eating sound 
				eatingSound.play()

				// If the snake's body is bigger than 1 set the new box's position to the old last box's position
				if(snakeBody.length>1){
					snakeBody[snakeBody.length-1].position.set(snakeBody[snakeBody.length-2].position.x,snakeBody[snakeBody.length-2].position.y,snakeBody[snakeBody.length-2].position.z);
				}

				// Remove the fruit and unset the fruitExists flag
				scene.remove(fruit);
				fruitExists = false;

				// Increase the player's score
				gui.controllers.forEach(element =>{
					if(element.property == "Score"){
						element.setValue(element.getValue()+1)
					}
				})
			}
		}

		// Check if the snake's head is colliding with any of its body
		// if it is play the defeat sound, alert the player, and refresh the page
		for(var i = 3 ; i<snakeBody.length;i++){
			if(isColliding(snakeHead,snakeBody[i])){
				defeatSound.play()
				alert("GAME OVER")
				location.reload()
			}
		}

});

// Function to check the collision between two objects
function isColliding(obj1, obj2) {
	if (obj1) {
	  if (obj2) {
		return (obj1.position.y == obj2.position.y && obj1.position.x == obj2.position.x)
	  }
	}
  }

// Orbit Controls initialization
const orbit = new OrbitControls(camera,renderer.domElement);
orbit.enabled = false

// fruitExists flag and creating the fruit mesh
var fruitExists = false
var fruit = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color: 0xff0000}));

// Frame id will be returned from requestAnimationFrame
var id;

// Get a random coordinate on the grid for the fruit to spawn
function random_coord(){
	return Math.random()>0.5 ?  Math.floor(Math.random()*10) -0.5:  -1 * (Math.floor(Math.random()*10)) + 0.5;
}



// Animation function that plays every frame
function animate() {

	// Requests that the animate function is called next frame
	id = requestAnimationFrame( animate );

	// Update orbit controls
	orbit.update();
	


	// this if statement runs once every 50 frames
	if(timer == 50){

		// Check if the snake's head is colliding with any of its body
		// if it is play the defeat sound, alert the player, and refresh the page
		for(var i = 3 ; i<snakeBody.length;i++){
			if(isColliding(snakeHead,snakeBody[i])){
				defeatSound.play()
				alert("GAME OVER")
				location.reload()
			}
		}

		// Move the snake's head automatically every 50 frames depending on
		// the movement vector
		snakeHead.position.x += movement_vector.x;
		snakeHead.position.y += movement_vector.y;
	

		// If the snake's body is bigger than 1 set the new box's position to the old last box's position
		if(snakeBody.length>1){
			for (var i = snakeBody.length - 1; i>=1;i--){
				snakeBody[i].position.set(snakeBody[i-1].position.x,snakeBody[i-1].position.y,snakeBody[i-1].position.z);
			}
		}

		// Reset timer
		timer = 0

		// If the fruit is not in the scene
		if(!fruitExists){

			// Set the fruitExists flag add the fruit to the scene at a random position
			fruitExists = true;
			scene.add(fruit)
			fruit.position.set(random_coord(),random_coord(),0)
		}
	
		// If the fruit is in the scene
		if(fruitExists){
	
			// If the snakeHead is colliding with the fruit
			if(isColliding(snakeHead,fruit)){

				// Play the eating sound
				eatingSound.play()

				// Add another box to the snakeBody array and add the box to the scene
				snakeBody.push(new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:0x60b922}) ));
				scene.add(snakeBody[snakeBody.length-1]);

				// If the snake's body is bigger than 1 set the new box's position to the old last box's position
				if(snakeBody.length>=1){
					snakeBody[snakeBody.length-1].position.set(snakeBody[snakeBody.length-2].position.x,snakeBody[snakeBody.length-2].position.y,snakeBody[snakeBody.length-2].position.z);
				}

				// Remove the fruit from the scene and unset the fruitExists flag
				scene.remove(fruit);
				fruitExists = false;

				// Increase player's score
				gui.controllers.forEach(element =>{
					if(element.property == "Score"){
						element.setValue(element.getValue()+1)
					}
				})
			}
		}

	}

	// If this isn't the 50th frame add 1 to the frame timer
	else{
		timer = timer + 1
	}


	// The next block check's if the snake's head is out of the bounds of the grid
	// if it is stop the animation, set the snake's head to a position within the bounds,
	// play the defeat sound, alert the user, and refresh the page
	if(snakeHead.position.x >10){
		cancelAnimationFrame( id );

		snakeHead.position.x = 9.5
		defeatSound.play()

		alert("GAME OVER")
		location.reload()

	}
	if(snakeHead.position.x <-10){
		cancelAnimationFrame( id );
		snakeHead.position.x = -9.5
		defeatSound.play()

		alert("GAME OVER")

		location.reload()

	}

	if(snakeHead.position.y >10){
		cancelAnimationFrame( id );
		snakeHead.position.y = 9.5
		defeatSound.play()

		alert("GAME OVER")

		location.reload()

	}

	if(snakeHead.position.y <-10){
		cancelAnimationFrame( id );
		snakeHead.position.y = -9.5
		defeatSound.play()
		alert("GAME OVER")
		

		location.reload()

	}
	
	// Renderer renders the scene from the camera's perspective
	renderer.render( scene, camera);
}

// Calling the animate function for the first time
animate();