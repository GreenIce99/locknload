let scene, camera, renderer, controls;
let bullets = [];
let enemies = [];
let score = 0;
let lives = 3;

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  
  renderer = new THREE.WebGLRenderer({canvas: document.getElementById("gameCanvas")});
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Controls
  controls = new THREE.PointerLockControls(camera, document.body);
  document.body.addEventListener("click", () => controls.lock());
  scene.add(controls.getObject());
  
  // Floor
  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMat = new THREE.MeshBasicMaterial({color: 0x333333});
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Lighting
  const light = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(light);

  // Spawn first enemies
  spawnEnemy();

  // Shooting
  document.addEventListener("click", shoot);

  // Resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function shoot() {
  const bulletGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const bulletMat = new THREE.MeshBasicMaterial({color: 0xffff00});
  const bullet = new THREE.Mesh(bulletGeo, bulletMat);
  bullet.position.copy(camera.position);
  bullet.velocity = new THREE.Vector3();
  bullet.velocity.set(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(0.5);
  scene.add(bullet);
  bullets.push(bullet);
}

function spawnEnemy() {
  const enemyGeo = new THREE.BoxGeometry(1, 1, 1);
  const enemyMat = new THREE.MeshBasicMaterial({color: 0xff0000});
  const enemy = new THREE.Mesh(enemyGeo, enemyMat);
  enemy.position.set((Math.random()-0.5)*50, 0.5, -50);
  scene.add(enemy);
  enemies.push(enemy);
  setTimeout(spawnEnemy, 2000); // new enemy every 2s
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  // Move bullets
  bullets.forEach((b, i) => {
    b.position.add(b.velocity);
    if (b.position.length() > 100) {
      scene.remove(b);
      bullets.splice(i, 1);
    }
  });

  // Move enemies
  enemies.forEach((e, i) => {
    e.position.z += 0.05;
    if (e.position.distanceTo(camera.position) < 2) {
      lives--;
      document.getElementById("lives").innerText = "Lives: " + lives;
      scene.remove(e);
      enemies.splice(i, 1);
      if (lives <= 0) {
        alert("Game Over! Final Score: " + score);
        window.location.reload();
      }
    }
    bullets.forEach((b, j) => {
      if (e.position.distanceTo(b.position) < 1) {
        score++;
        document.getElementById("score").innerText = "Score: " + score;
        scene.remove(e);
        scene.remove(b);
        enemies.splice(i, 1);
        bullets.splice(j, 1);
      }
    });
  });
}
