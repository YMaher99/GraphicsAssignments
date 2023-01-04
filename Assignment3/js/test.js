import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
const scene = new THREE.Scene();

var width = 34
var height = 20
var near = 0.1
var far = 100
var timer = 0;

var enemyMovementTimer = 0
var enemyMovementTimerMax = 200;

//const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, near, far );

const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

const laserSound = new THREE.Audio(listener);
audioLoader.load("./laser shot.mp3", function(buffer){
	laserSound.setBuffer(buffer);
	laserSound.setLoop(false);
	laserSound.setVolume(0.1);
});

const invaderDeath = new THREE.Audio(listener);
audioLoader.load("./invader death.mp3", function(buffer){
	invaderDeath.setBuffer(buffer);
	invaderDeath.setLoop(false);
	invaderDeath.setVolume(1.0);
	invaderDeath.duration = 0.1 ;
});

const playerDeathSound = new THREE.Audio(listener);
audioLoader.load("./player_death.mp3",function(buffer){
	playerDeathSound.setBuffer(buffer);
	playerDeathSound.setLoop(false);
	playerDeathSound.setVolume(1.0);
});

const invadersReachedEarthSound = new THREE.Audio(listener);
audioLoader.load("./invaders reached earth.mp3",function(buffer){
	invadersReachedEarthSound.setBuffer(buffer);
	invadersReachedEarthSound.setLoop(false);
	invadersReachedEarthSound.setVolume(1.0);
});

const victorySound = new THREE.Audio(listener);
audioLoader.load("./won.mp3",function(buffer){
	victorySound.setBuffer(buffer);
	victorySound.setLoop(false);
	victorySound.setVolume(1.0);
});

camera.add(listener);



var difficulty = null;

while(!difficulty){
	difficulty = prompt("Please enter the difficulty E/N/H", "N").toLowerCase();

	switch(difficulty){
		case "e":
			enemyMovementTimerMax = 400;
			break;
		case "n":
			enemyMovementTimerMax = 200;
			break;
		case "h	":
			enemyMovementTimerMax = 100;
			break;
		default:
			enemyMovementTimerMax = 200;
			break;
	}
}

alert("Aliens are invading Earth. Shoot them all before they reach Earth!")

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);



camera.position.set(0,0,-10);
camera.rotateZ(-Math.PI/2)
var texture = new THREE.TextureLoader().load( "./space.jpg" )

const planeMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(20,20),
	new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		visible: true,
		map: texture
	})
);



scene.add(planeMesh);


const grid = new THREE.GridHelper(20,20);
grid.rotateX(-Math.PI/2)
grid.visible = false
scene.add(grid)

const bulletGeometry = new THREE.BoxGeometry( 0.05, 0.7, 1 );


var bulletArray = []

var gui = new GUI();


var controls = {
	Left: "A",
	Shoot: "Space",
	Right:"D"
}

gui.title("")

var controls_folder = gui.addFolder("Controls")


controls_folder.add(controls,"Left")
controls_folder.add(controls,"Shoot")
controls_folder.add(controls,"Right")



const spaceship_map = new THREE.TextureLoader().load( 'spaceship.png' );
const material_spaceship = new THREE.SpriteMaterial( { map: spaceship_map } );

const spaceship = new THREE.Sprite( material_spaceship );
spaceship.position.set(0.5,-9.5,0)
scene.add( spaceship );

const enemy_map = new THREE.TextureLoader().load( 'enemy.png' );
const material_enemy = new THREE.SpriteMaterial( { map: enemy_map } );

var enemyArray = []
var enemyBulletArray = []

for (var x = 8.5; x>=-8.5 ; x-=1){
	enemyArray.push(new THREE.Sprite( material_enemy ));
	enemyArray[enemyArray.length-1].position.set(x,8.5,0);
	enemyArray.push(new THREE.Sprite( material_enemy ));
	enemyArray[enemyArray.length-1].position.set(x,7.5,0);
}

enemyArray.forEach(enemy =>{
	scene.add(enemy);
})


window.addEventListener('keydown', function (e) {

		if (e.key == 'D' || e.key == "d") {
			spaceship.position.x -= 1;
			console.log(spaceship.position)
			
		}

		if(e.key == "A" || e.key == "a"){
			spaceship.position.x +=1;

		}

		if(e.key == " " || e.code == "Space"){
			bulletArray.push(new THREE.Mesh( bulletGeometry, new THREE.MeshPhongMaterial({color: 0x00ff00})))
			bulletArray[bulletArray.length-1].position.set(spaceship.position.x,spaceship.position.y+1,spaceship.position.z)

			scene.add(bulletArray[bulletArray.length-1]);
			laserSound.play()
		}

		if(spaceship.position.x>10){
			spaceship.position.x = 9.5;
		}
		
		if(spaceship.position.x<-10){
			spaceship.position.x = -9.5
	
		}

});


function isColliding(obj1, obj2) {
	if (obj1) {
	  if (obj2) {
		return (obj1.position.y == obj2.position.y && obj1.position.x == obj2.position.x)
	  }
	}
  }


const orbit = new OrbitControls(camera,renderer.domElement);
orbit.enabled = false


var deathFlag = false;
var gameOverFlag = false
var id;


function animate() {
	id = requestAnimationFrame( animate );

	orbit.update();

	enemyArray.forEach(enemy =>{
		bulletArray.forEach(bullet =>{
			if (isColliding(enemy,bullet)){
				scene.remove(bullet)
				scene.remove(enemy)
				bulletArray.splice(bulletArray.indexOf(bullet),1);
				enemyArray.splice(enemyArray.indexOf(enemy),1);
				invaderDeath.play()
			}
			
		})

	})

	if(spaceship.position.x>10){
		spaceship.position.x = 9.5;
	}
	
	if(spaceship.position.x<-10){
		spaceship.position.x = -9.5

	}
	
	if(enemyMovementTimer == enemyMovementTimerMax){
		
		enemyMovementTimer = 0



		enemyArray.forEach(enemy =>{
			enemy.position.y-=1;
			if(isColliding(enemy,spaceship)){
				deathFlag = true;
			}
			if(enemy.position.y == -9.5){
				gameOverFlag = true;
			}

		})

		if(deathFlag){
			playerDeathSound.play();
			alert("The aliens destroyed your spaceship!")
			location.reload()
		}
		else if (gameOverFlag){
			invadersReachedEarthSound.play()
			alert("The aliens reached earth!")
			location.reload()
		}




	}
	else{enemyMovementTimer+=1}



	if(timer == 20){

		timer = 0
		



		bulletArray.forEach(bullet =>{
			bullet.position.y +=1;
			if(bullet.position.y > 10){
				scene.remove(bullet);
				bulletArray.splice(bulletArray.indexOf(bullet),1);
				
			}
		})



		if(enemyArray.length == 0){
			victorySound.play()
			alert("YOU WON!")
			
			location.reload()
		}

	}
	else{
		timer = timer + 1
	}

	renderer.render( scene, camera);
}
animate();