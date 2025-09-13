let scene, camera, renderer, controls;
let bullets = [];
let enemies = [];
let score = 0;
let lives = 3;
let move = { forward:false, backward:false, left:false, right:false };
let gameRunning = false;
let gamePaused = false;

// Difficulty variables
let enemySpeed = 0.05;
let spawnInterval = 2000;
let difficultyTimer = 0;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({canvas: document.getElementById("gameCanvas")});
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Controls
  controls = new THREE.PointerLockControls(camera, document.body);
  scene.add(controls.getObject());
  controls.getObject().position.set(0,2,5);

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100,100), new THREE.MeshBasicMaterial({color:0x333333}));
  floor.rotation.x = -Math.PI/2;
  scene.add(floor);

  // Lighting
  const light = new THREE.AmbientLight(0xffffff,0.8);
  scene.add(light);

  // START BUTTON FIXED
  const startOverlay = document.getElementById("startOverlay");
  const startBtn = document.getElementById("startButton");
  startBtn.addEventListener("click", () => {
      startOverlay.style.display = "none";   // Hide overlay
      document.getElementById("hud").style.display = "block"; // Show HUD
      controls.lock(); // Must be triggered by this click
  });

  // Start game after pointer lock
  controls.addEventListener("lock", () => {
      if(!gameRunning){
          gameRunning = true;
          gamePaused = false;
          spawnEnemy();
          animate();
      }
  });

  // Pause menu
  document.getElementById("resumeButton").addEventListener("click", ()=>{
    document.getElementById("pauseScreen").style.display="none";
    controls.lock(); gamePaused=false; gameRunning=true; animate();
  });
  document.getElementById("quitButton").addEventListener("click", ()=>window.location.reload());
  document.getElementById("restartButton").addEventListener("click", ()=>window.location.reload());

  // Shooting
  document.addEventListener("mousedown", ()=>{if(gameRunning && !gamePaused) shoot();});

  // Movement
  document.addEventListener("keydown",(e)=>{
    if(e.code==="KeyW") move.forward=true;
    if(e.code==="KeyS") move.backward=true;
    if(e.code==="KeyA") move.left=true;
    if(e.code==="KeyD") move.right=true;
  });
  document.addEventListener("keyup",(e)=>{
    if(e.code==="KeyW") move.forward=false;
    if(e.code==="KeyS") move.backward=false;
    if(e.code==="KeyA") move.left=false;
    if(e.code==="KeyD") move.right=false;
  });

  // ESC pause
  controls.addEventListener("unlock", ()=>{
    if(gameRunning && !gamePaused){
      gamePaused=true; gameRunning=false;
      document.getElementById("pauseScreen").style.display="flex";
    }
  });

  // Resize
  window.addEventListener("resize", ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function shoot(){
  const bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.1,8,8),
    new THREE.MeshBasicMaterial({color:0xffff00})
  );
  bullet.position.copy(controls.getObject().position);
  bullet.velocity = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).multiplyScalar(0.5);
  scene.add(bullet); bullets.push(bullet);
}

function spawnEnemy(){
  if(!gameRunning) return;
  const enemy = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color:0xff0000})
  );
  enemy.position.set((Math.random()-0.5)*50,0.5,-50);
  scene.add(enemy); enemies.push(enemy);
  setTimeout(spawnEnemy, spawnInterval);
}

function animate(){
  if(!gameRunning || gamePaused) return;
  requestAnimationFrame(animate);

  // Difficulty increase
  difficultyTimer += 0.016;
  if(difficultyTimer >= 10){
    enemySpeed += 0.01;
    spawnInterval = Math.max(500, spawnInterval - 100);
    difficultyTimer = 0;
  }

  const speed=0.1;
  if(move.forward) controls.moveForward(speed);
  if(move.backward) controls.moveForward(-speed);
  if(move.left) controls.moveRight(-speed);
  if(move.right) controls.moveRight(speed);

  bullets.forEach((b,i)=>{
    b.position.add(b.velocity);
    if(b.position.length()>100){scene.remove(b); bullets.splice(i,1);}
  });

  enemies.forEach((e,i)=>{
    const dir = new THREE.Vector3();
    dir.subVectors(controls.getObject().position, e.position).setY(0).normalize();
    e.position.add(dir.multiplyScalar(enemySpeed));

    if(e.position.distanceTo(controls.getObject().position)<2){
      lives--; document.getElementById("lives").innerText="Lives: "+lives;
      scene.remove(e); enemies.splice(i,1);
      if(lives<=0) endGame();
    }
    bullets.forEach((b,j)=>{
      if(e.position.distanceTo(b.position)<1){
        score++; document.getElementById("score").innerText="Score: "+score;
        scene.remove(e); scene.remove(b);
        enemies.splice(i,1); bullets.splice(j,1);
      }
    });
  });

  renderer.render(scene,camera);
}

function endGame(){
  gameRunning=false; gamePaused=false;
  document.getElementById("hud").style.display="none";
  document.getElementById("pauseScreen").style.display="none";
  document.getElementById("gameOverScreen").style.display="flex";
  document.getElementById("finalScore").innerText="Final Score: "+score;
}

init();
