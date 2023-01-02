import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
const scene = new THREE.Scene();

var width = 32
var height = 20
var near = 0.1
var far = 100
var timer = 0;

//const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, near, far );

const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
const eatingSound = new THREE.Audio(listener);
audioLoader.load("./eating.mp3", function(buffer){
	eatingSound.setBuffer(buffer);
	eatingSound.setLoop(false);
	eatingSound.setVolume(1.0);
});

const defeatSound = new THREE.Audio(listener);
audioLoader.load("./defeat.mp3",function(buffer){
	defeatSound.setBuffer(buffer);
	defeatSound.setLoop(false);
	defeatSound.setVolume(1.0);
});

camera.add(listener);



const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);



camera.position.set(0,0,-10);
camera.rotateZ(-Math.PI/2)
var texture = new THREE.TextureLoader().load( "./grass.jpg" )

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
scene.add(grid)



var gui = new GUI();
var myObject = {
	Score: 0,
};

var controls = {
	Up: "W",
	Left: "A",
	Down: "S",
	Right:"D"
}

gui.title("")
gui.add(myObject,'Score')	

var controls_folder = gui.addFolder("Controls")

controls_folder.add(controls, "Up")
controls_folder.add(controls,"Left")
controls_folder.add(controls,"Down")
controls_folder.add(controls,"Right")


var movement_vector = new THREE.Vector3(-1,0,0)

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshPhongMaterial( { color: 0x000000 } );
const snakeHead = new THREE.Mesh( geometry, material );
snakeHead.position.set(0.5,0.5,0)
scene.add(snakeHead)

var snakeBody = [snakeHead]


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

		if(snakeBody.length>1){
			for (var i = snakeBody.length - 1; i>=1;i--){
				snakeBody[i].position.set(snakeBody[i-1].position.x,snakeBody[i-1].position.y,snakeBody[i-1].position.z);
			}
		}

		if(fruitExists){
	
			if(isColliding(snakeHead,fruit)){
				console.log("COLLISION")
				snakeBody.push(new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:0x00ff00}) ));
				scene.add(snakeBody[snakeBody.length-1]);
				eatingSound.play()
				if(snakeBody.length>1){
					snakeBody[snakeBody.length-1].position.set(snakeBody[snakeBody.length-2].position.x,snakeBody[snakeBody.length-2].position.y,snakeBody[snakeBody.length-2].position.z);
				}
				scene.remove(fruit);
				fruitExists = false;
				gui.controllers.forEach(element =>{
					if(element.property == "Score"){
						element.setValue(element.getValue()+1)
					}
				})
			}
		}

		for(var i = 3 ; i<snakeBody.length;i++){
			if(isColliding(snakeHead,snakeBody[i])){
				defeatSound.play()
				alert("GAME OVER")
				location.reload()
				
			}
		}

});

console.log(snakeHead.position)

function isColliding(obj1, obj2) {
	if (obj1) {
	  if (obj2) {
		return (obj1.position.y == obj2.position.y && obj1.position.x == obj2.position.x)
	  }
	}
  }


const orbit = new OrbitControls(camera,renderer.domElement);
orbit.enabled = false


var fruitExists = false
var fruit = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color: 0xff0000}));

var id;

function random_coord(){
	return Math.random()>0.5 ?  Math.floor(Math.random()*10) -0.5:  -1 * (Math.floor(Math.random()*10)) + 0.5;
}


function animate() {
	id = requestAnimationFrame( animate );

	orbit.update();
	



	if(timer == 50){
		for(var i = 3 ; i<snakeBody.length;i++){
			if(isColliding(snakeHead,snakeBody[i])){
				defeatSound.play()

				alert("GAME OVER")

				location.reload()

			}
		}
		snakeHead.position.x += movement_vector.x;
		snakeHead.position.y += movement_vector.y;
	
		if(snakeBody.length>1){
			for (var i = snakeBody.length - 1; i>=1;i--){
				snakeBody[i].position.set(snakeBody[i-1].position.x,snakeBody[i-1].position.y,snakeBody[i-1].position.z);
			}
		}

		timer = 0
		if(!fruitExists){
			fruitExists = true;
			scene.add(fruit)
			fruit.position.set(random_coord(),random_coord(),0)
			console.log(fruit.position)

		}
	
		if(fruitExists){
	
			if(isColliding(snakeHead,fruit)){
				eatingSound.play()
				snakeBody.push(new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:0x00ff00}) ));
				scene.add(snakeBody[snakeBody.length-1]);
				console.log(snakeBody)
				if(snakeBody.length>=1){
					snakeBody[snakeBody.length-1].position.set(snakeBody[snakeBody.length-2].position.x,snakeBody[snakeBody.length-2].position.y,snakeBody[snakeBody.length-2].position.z);
				}
				scene.remove(fruit);
				fruitExists = false;
				gui.controllers.forEach(element =>{
					if(element.property == "Score"){
						element.setValue(element.getValue()+1)
					}
				})
			}
		}

	}
	else{
		timer = timer + 1
	}
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

	renderer.render( scene, camera);
}
animate();