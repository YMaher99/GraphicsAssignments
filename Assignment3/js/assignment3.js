// Import threejs, DAT GUI, and Orbit Controls
import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';

// Create a new scene
const scene = new THREE.Scene();

// Camera Variables (16:9 aspect Ratio)
var width = 40
var height = 22.5
var near = 0.1
var far = 100
var timer = 0;

// Timer for enemyMovement
var enemyMovementTimer = 0
var enemyMovementTimerMax = 200;

// Create an orthographic camera with previously initialized camera variables
var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, near, far );

// Create an AudioListener to play the audio and an AudioLoader to load the audio files
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

// Loading the laser sound
const laserSound = new THREE.Audio(listener);
audioLoader.load("./laser shot.mp3", function(buffer){
	laserSound.setBuffer(buffer);
	laserSound.setLoop(false);
	laserSound.setVolume(0.1);
});

// Loading the invader death sound
const invaderDeath = new THREE.Audio(listener);
audioLoader.load("./invader death.mp3", function(buffer){
	invaderDeath.setBuffer(buffer);
	invaderDeath.setLoop(false);
	invaderDeath.setVolume(1.0);
	invaderDeath.duration = 0.1 ;
});

// Loading the player death sound
const playerDeathSound = new THREE.Audio(listener);
audioLoader.load("./player_death.mp3",function(buffer){
	playerDeathSound.setBuffer(buffer);
	playerDeathSound.setLoop(false);
	playerDeathSound.setVolume(1.0);
});

// Loading the invaders reached earth sound
const invadersReachedEarthSound = new THREE.Audio(listener);
audioLoader.load("./invaders reached earth.mp3",function(buffer){
	invadersReachedEarthSound.setBuffer(buffer);
	invadersReachedEarthSound.setLoop(false);
	invadersReachedEarthSound.setVolume(1.0);
});

// Loading the victory sound
const victorySound = new THREE.Audio(listener);
audioLoader.load("./won.mp3",function(buffer){
	victorySound.setBuffer(buffer);
	victorySound.setLoop(false);
	victorySound.setVolume(1.0);
});

// Add the listener to the camera
camera.add(listener);



var difficulty = null;

// Continuosuly Prompt the user for the difficulty they want and set the Max timer depending on difficulty
while(!difficulty){
	difficulty = prompt("Please enter the difficulty E/N/H", "N").toLowerCase();

	switch(difficulty){
		case "e":
			enemyMovementTimerMax = 400;
			break;
		case "n":
			enemyMovementTimerMax = 200;
			break;
		case "h":
			enemyMovementTimerMax = 100;
			break;
		default:
			enemyMovementTimerMax = 200;
			break;
	}
}

// Alert the player of the objective of the game
alert("Aliens are invading Earth. Shoot them all before they reach Earth!")

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
var texture = new THREE.TextureLoader().load( "./space.jpg" )

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
grid.visible = false
scene.add(grid)

// Create a box geometry for the player's laser bullet
const bulletGeometry = new THREE.BoxGeometry( 0.05, 0.7, 1 );

// Create an Array of player bullets
var bulletArray = []

// Adding a GUI
var gui = new GUI();

// Control Values in the GUI
var controls = {
	Left: "A",
	Shoot: "Space",
	Right:"D"
}

// Set GUI title to empty string
gui.title("")

// Add folder to GUI for controls
var controls_folder = gui.addFolder("Controls")

// Add controls to the controls folder in the GUI
controls_folder.add(controls,"Left")
controls_folder.add(controls,"Shoot")
controls_folder.add(controls,"Right")


// Creating the spaceship out of a texture and sprite material and sprite and adding it to the scene
const spaceship_map = new THREE.TextureLoader().load( 'spaceship.png' );
const material_spaceship = new THREE.SpriteMaterial( { map: spaceship_map } );

const spaceship = new THREE.Sprite( material_spaceship );
spaceship.position.set(0.5,-9.5,0)
scene.add( spaceship );

// Creating enemy texture and sprite material
const enemy_map = new THREE.TextureLoader().load( 'enemy.png' );
const material_enemy = new THREE.SpriteMaterial( { map: enemy_map } );

// Creating Array of enemies
var enemyArray = []

// Fill the enemyArray with Sprites of enemies
for (var x = 8.5; x>=-8.5 ; x-=1){
	enemyArray.push(new THREE.Sprite( material_enemy ));
	enemyArray[enemyArray.length-1].position.set(x,8.5,0);
	enemyArray.push(new THREE.Sprite( material_enemy ));
	enemyArray[enemyArray.length-1].position.set(x,7.5,0);
}

// Add all enemies in the enemyArray to the scene
enemyArray.forEach(enemy =>{
	scene.add(enemy);
})

// Add an event listener for when a user presses keyboard buttons (i.e. controls for the game)
window.addEventListener('keydown', function (e) {

		if (e.key == 'D' || e.key == "d") {
			spaceship.position.x -= 1;			
		}

		if(e.key == "A" || e.key == "a"){
			spaceship.position.x +=1;
		}

		// If the player presses the spacebar creating a new bullet,
		// add the bullet to the bulletArray and add it to the scene
		// and play the laser sound
		if(e.key == " " || e.code == "Space"){
			bulletArray.push(new THREE.Mesh( bulletGeometry, new THREE.MeshPhongMaterial({color: 0x00ff00})))
			bulletArray[bulletArray.length-1].position.set(spaceship.position.x,spaceship.position.y+1,spaceship.position.z)

			scene.add(bulletArray[bulletArray.length-1]);
			laserSound.play()
		}


		// The next block checks if the player spaceship is within the grid 
		// if not the spaceship is placed back within the grid
		if(spaceship.position.x>10){
			spaceship.position.x = 9.5;
		}
		
		if(spaceship.position.x<-10){
			spaceship.position.x = -9.5
	
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

// Flags for player colliding with the invaders and invaders reaching earth
var deathFlag = false;
var gameOverFlag = false

// Frame id will be returned from requestAnimationFrame
var id;

// Animation function that plays every frame
function animate() {

	// Requests that the animate function is called next frame
	id = requestAnimationFrame( animate );

	// Update orbit controls
	orbit.update();

	// The following block checks if any of the enemies have collided with any of the player's bullets
	enemyArray.forEach(enemy =>{
		bulletArray.forEach(bullet =>{
			if (isColliding(enemy,bullet)){
	
				// Remove both the bullet and the enemy from the scene and their respective arrays and play the invader death song
				scene.remove(bullet)
				scene.remove(enemy)
				bulletArray.splice(bulletArray.indexOf(bullet),1);
				enemyArray.splice(enemyArray.indexOf(enemy),1);
				invaderDeath.play()
			}
			
		})

	})

	// The next block checks if the player spaceship is within the grid 
	// if not the spaceship is placed back within the grid		
	if(spaceship.position.x>10){
		spaceship.position.x = 9.5;
	}
	
	if(spaceship.position.x<-10){
		spaceship.position.x = -9.5

	}

	// Check if it is the correct time to move the enemies
	if(enemyMovementTimer == enemyMovementTimerMax){
		
		// Reset the timer
		enemyMovementTimer = 0

		// Move each enemy down once
		enemyArray.forEach(enemy =>{
			enemy.position.y-=1;

			// Check if each enemy is colliding with the player if they are set the deathFlag
			if(isColliding(enemy,spaceship)){
				deathFlag = true;
			}

			// Check if each enemy "reached Earth" if they did set the gameOverFlag
			if(enemy.position.y == -9.5){
				gameOverFlag = true;
			}

		})

		// if an enemy collided with the player
		if(deathFlag){
			
			// Play the death sound, alert the user, and refresh the page
			playerDeathSound.play();
			alert("The aliens destroyed your spaceship!")
			location.reload()
		}

		// if an enemy "reached Earth"
		else if (gameOverFlag){

			// Play the invaders reached earth sound, alert the user, and refresh the page
			invadersReachedEarthSound.play()
			alert("The aliens reached earth!")
			location.reload()
		}




	}

	// If it isn't the time to move the enemies increment the timer
	else{enemyMovementTimer+=1}


	// Check if it is the time to move the laser
	if(timer == 20){

		// Reset the timer
		timer = 0
		
		// Move each bullet and if it has left the grid remove it from scene and from the bulletArray
		bulletArray.forEach(bullet =>{
			bullet.position.y +=1;
			if(bullet.position.y > 10){
				scene.remove(bullet);
				bulletArray.splice(bulletArray.indexOf(bullet),1);
			}
		})


		// If all the enemies are removed from the enemyArray (i.e. all killed)
		if(enemyArray.length == 0){

			// Play the victory sound, alert the player, and refresh the page
			victorySound.play()
			alert("YOU WON!")
			location.reload()
		}

	}

	// If it isn't the time to move the laser increment the timer
	else{
		timer = timer + 1
	}

	// Renderer renders the scene from the camera's perspective
	renderer.render( scene, camera);
}

// Calling the animate function for the first time
animate();