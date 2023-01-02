import * as THREE from 'https://cdn.skypack.dev/three@0.136';
import { GUI } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';
const scene = new THREE.Scene();

var width = 25
var height = 25
var near = 0.1
var far = 100
var timer = 0;

//const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, near, far );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );



const ambient = new THREE.AmbientLight(0xffffff);
scene.add(ambient);



camera.position.set(0,0,-20);
camera.rotateZ(-Math.PI/2)

const planeMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(20,20),
	new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		visible: true
	})
);

console.log(planeMesh);



scene.add(planeMesh);


const grid = new THREE.GridHelper(20,20);
grid.rotateX(-Math.PI/2)
scene.add(grid)



var gui = new GUI();
var myObject = {
	Score: 0,
};


gui.add(myObject,'Score');
gui.title("SCORE")

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

		if(snakeBody.length>=1){
			for (var i = snakeBody.length - 1; i>=1;i--){
				snakeBody[i].position.set(snakeBody[i-1].position.x,snakeBody[i-1].position.y,snakeBody[i-1].position.z);
			}
		}

				if(fruitExists){
	
			if(isColliding(snakeHead,fruit)){
				console.log("COLLISION")
				snakeBody.push(new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:0x00ff00}) ));
				scene.add(snakeBody[snakeBody.length-1]);
				console.log(snakeBody)
				if(snakeBody.length>=1){
					snakeBody[snakeBody.length-1].position.set(snakeBody[snakeBody.length-2].position.x,snakeBody[snakeBody.length-2].position.y,snakeBody[snakeBody.length-2].position.z);
				}
				scene.remove(fruit);
				fruitExists = false;
				gui.controllers.forEach(element =>{
					element.setValue(element.getValue()+1)
				})
			}
		}

});

console.log(snakeHead.position)

function isColliding(obj1, obj2) {
	if (obj1) {
	  if (obj2) {
		return (obj1.position.y == obj2.position.y && obj1.position.x == obj2.position.x)
		//return Math.abs(obj1.position.y - obj2.position.y) < 1 && Math.abs(obj1.position.x - obj2.position.x) < 8;
	  }
	}
  }


const orbit = new OrbitControls(camera,renderer.domElement);
orbit.enabled = false


var fruitExists = false
var fruit = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color: 0xff0000}));

var rand1, rand2;


function animate() {
	requestAnimationFrame( animate );

	orbit.update();
	


	if(timer == 50){
		snakeHead.position.x += movement_vector.x;
		snakeHead.position.y += movement_vector.y;
	
		if(snakeBody.length>=1){
			for (var i = snakeBody.length - 1; i>=1;i--){
				snakeBody[i].position.set(snakeBody[i-1].position.x,snakeBody[i-1].position.y,snakeBody[i-1].position.z);
			}
		}

		timer = 0
		if(!fruitExists){
			fruitExists = true;
			scene.add(fruit)
			fruit.position.set(Math.floor(Math.random()*10) -0.5,Math.floor(Math.random()*10) -0.5,0)
			console.log(fruit.position)
			//fruit.position.set(-1.5,-1.5,0);


		}
	
		if(fruitExists){
	
			if(isColliding(snakeHead,fruit)){
				console.log("COLLISION")
				snakeBody.push(new THREE.Mesh( geometry, new THREE.MeshPhongMaterial({color:0x00ff00}) ));
				scene.add(snakeBody[snakeBody.length-1]);
				console.log(snakeBody)
				if(snakeBody.length>=1){
					snakeBody[snakeBody.length-1].position.set(snakeBody[snakeBody.length-2].position.x,snakeBody[snakeBody.length-2].position.y,snakeBody[snakeBody.length-2].position.z);
				}
				scene.remove(fruit);
				fruitExists = false;
				gui.controllers.forEach(element =>{
					element.setValue(element.getValue()+1)
				})
			}
		}

	}
	else{
		timer = timer + 1
	}
	if(snakeHead.position.x >10){
		snakeHead.position.x = 9.5
	}
	if(snakeHead.position.x <-10){
		snakeHead.position.x = -9.5
	}

	if(snakeHead.position.y >10){
		snakeHead.position.y = 9.5
	}

	if(snakeHead.position.y <-10){
		snakeHead.position.y = -9.5
	}

	renderer.render( scene, camera);
}
animate();