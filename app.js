if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope
        );
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}

const rewards = ["Ponožky", "Mikádo", "Přívěsek", "Balónek", "Opalovací krém"];
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const rollButton = document.getElementById("rollButton");
const gameLogo = document.getElementById("gameLogo");
const garage = document.getElementById("garage");
const alertDiv = document.getElementById("alertDiv");
const watermark = document.getElementById("watermark");
const rewardScreen = document.getElementById("rewardScreen");

let groundImg = new Image();
groundImg.src = "assets/ZLKLGround.png"; // Path to the ground sprite

const skullImg = new Image();
skullImg.src = "assets/lebka.png";

let character = {
  img: new Image(),
  x: canvas.width / 2,
  y: 0, // Will be set once the ground image is loaded
  width: 100, // Fixed width
  height: 150, // Adjusted proportionally
  direction: "right",
  velocityX: 0,
  velocityY: 0,
  speed: 7,
  jumpStrength: 15, // Increased jump strength
  gravity: 0.5,
  onGround: true,
  opacity: 1.0, // Default opacity
};

character.img.src = "assets/ZLKLPostavička.png";

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 5 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * -1 - 1;
    this.color = "rgba(211, 211, 211, 0.8)"; // Light gray color
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0.2) this.size -= 0.1;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size); // Draw as square
  }
}

class FallingObject {
  constructor(x, y, width, height, speed, imageSrc) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.img = new Image();
    this.img.src = imageSrc;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  isCaught(character) {
    return (
      this.x < character.x + character.width &&
      this.x + this.width > character.x &&
      this.y < character.y + character.height &&
      this.y + this.height > character.y
    );
  }
}

let particlesArray = [];
let objectsArray = [];
let score = 0;
let gameOver = false;
let win = false;

function handleParticles() {
  // Update and draw particles
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();
    // Remove small particles
    if (particlesArray[i].size <= 0.2) {
      particlesArray.splice(i, 1);
      i--;
    }
  }
}

function spawnObject() {
  if (objectsArray.length < 1) {
    const x = Math.random() * (canvas.width - 60) + 30; // Limit spawn range to central area
    const y = 0;
    const width = 70;
    const height = 70;
    const speed = 1.7 + score * 0.01; // Increase speed slightly with score

    // Randomly choose between the two images
    const images = ["assets/soucastka1pixel.png", "assets/soucastka2pixel.png"];
    const imageSrc = images[Math.floor(Math.random() * images.length)];

    objectsArray.push(new FallingObject(x, y, width, height, speed, imageSrc));
  }
}

function spawnObjectsContinuously() {
  if (!gameOver && !win) {
    spawnObject();
    setTimeout(spawnObjectsContinuously, 1000); // Fixed spawn interval
  }
}

function updateObjects() {
  for (let i = 0; i < objectsArray.length; i++) {
    objectsArray[i].update();
    objectsArray[i].draw();

    if (objectsArray[i].isCaught(character)) {
      score++;
      flashCharacter(); // Flash the character when a falling object is caught

      objectsArray.splice(i, 1);
      i--;
      if (score >= 20) {
        win = true;
        changeScene("win");
      }
    } else if (objectsArray[i].y > canvas.height) {
      gameOver = true;
      changeScene("game_over");
    }
  }
}

let keys = {};
let groundLevel = canvas.height - 100; // Default value, will be updated

function drawGround() {
  ctx.drawImage(
    groundImg,
    0,
    canvas.height - groundImg.height,
    canvas.width,
    groundImg.height
  );
  groundLevel = canvas.height - groundImg.height + 50; // Update ground level based on ground sprite height
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  groundLevel = canvas.height - groundImg.height; // Update ground level based on ground sprite height
  character.y = groundLevel - character.height - 20; // Set character's initial position 20px lower
}

function drawCharacter() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround(); // Draw ground first

  // Handle particles
  handleParticles();

  // Handle falling objects
  updateObjects();

  ctx.save();
  ctx.globalAlpha = character.opacity; // Set the character's opacity
  if (character.direction === "left") {
    ctx.scale(-1, 1);
    ctx.drawImage(
      character.img,
      -character.x - character.width,
      character.y,
      character.width,
      character.height
    );
  } else {
    ctx.drawImage(
      character.img,
      character.x,
      character.y,
      character.width,
      character.height
    );
  }
  ctx.restore();
  if (gameOver) {
    ctx.drawImage(
      skullImg,
      character.x + character.width / 2 - skullImg.width / 2,
      character.y - skullImg.height - 10
    );
  }

  // Display score
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(score + "/20", 20, 30);
}

function flashCharacter() {
  character.opacity = 0.5; // Lower the opacity
  setTimeout(() => {
    character.opacity = 1.0; // Restore the original opacity after 200ms
  }, 200);
}

function updateCharacterPosition() {
  if (gameOver || win) {
    return; // Stop updating if game over or win
  }

  let moving = false;
  if (keys["ArrowLeft"] || keys["a"] || keys["A"] || keys["left"]) {
    character.velocityX = -character.speed;
    character.direction = "left";
    moving = true;
  } else if (keys["ArrowRight"] || keys["d"] || keys["D"] || keys["right"]) {
    character.velocityX = character.speed;
    character.direction = "right";
    moving = true;
  } else {
    character.velocityX = 0;
  }

  if (
    (keys["ArrowUp"] || keys[" "] || keys["Spacebar"] || keys["jump"]) &&
    character.onGround
  ) {
    character.velocityY = -character.jumpStrength;
    character.onGround = false;
    moving = true;
  }

  character.x += character.velocityX;
  character.y += character.velocityY;
  character.velocityY += character.gravity;

  // Boundary checks to prevent the character from moving outside the screen
  if (character.x < 0) {
    character.x = 0;
  }
  if (character.x + character.width > canvas.width) {
    character.x = canvas.width - character.width;
  }

  // Check if the character has landed on the ground
  if (character.y + character.height >= groundLevel) {
    character.y = groundLevel - character.height;
    character.velocityY = 0;
    character.onGround = true;
  }

  // Generate particles when moving
  if (moving) {
    for (let i = 0; i < 5; i++) {
      particlesArray.push(
        new Particle(
          character.x + character.width / 2,
          character.y + character.height
        )
      );
    }
  }

  drawCharacter();
  requestAnimationFrame(updateCharacterPosition);
}

window.addEventListener("keydown", (event) => {
  keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key] = false;
});

window.addEventListener("resize", resize);

groundImg.onload = function () {
  resize();
  changeScene("start");
};

// Touch controls for mobile devices
const leftButton = document.createElement("button");
leftButton.classList.add("leftButton");
document.body.appendChild(leftButton);

const rightButton = document.createElement("button");
rightButton.classList.add("rightButton");
document.body.appendChild(rightButton);

leftButton.addEventListener("touchstart", () => (keys["left"] = true));
leftButton.addEventListener("touchend", () => (keys["left"] = false));
rightButton.addEventListener("touchstart", () => (keys["right"] = true));
rightButton.addEventListener("touchend", () => (keys["right"] = false));

canvas.addEventListener("touchstart", () => (keys["jump"] = true));
canvas.addEventListener("touchend", () => (keys["jump"] = false));

function detectDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (
    /android/i.test(userAgent) ||
    (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)
  ) {
    return "mobile"; // Mobile device or tablet detected
  }

  if (/iPhone|Android/.test(userAgent) && window.innerWidth <= 480) {
    return "phone"; // Phone detected
  }

  return "desktop"; // Desktop or other device detected
}

const deviceType = detectDevice(); // Detect device once and store the result

function showButtons() {
  if (deviceType === "mobile" || deviceType === "phone") {
    leftButton.style.display = "flex";
    rightButton.style.display = "flex";
  } else {
    hideButtons();
  }
}
function hideButtons() {
  leftButton.style.display = "none";
  rightButton.style.display = "none";
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
function changeScene(scene) {
  garageDown(() => {
    switch (scene) {
      case "start":
        startButton.style.display = "block";
        gameLogo.style.display = "block";
        canvas.style.display = "none";
        restartButton.style.display = "none";
        watermark.style.display = "flex";
        rewardScreen.style.display = "none";

        hideButtons();
        break;
      case "game":
        startButton.style.display = "none";
        gameLogo.style.display = "none";
        canvas.style.display = "block";
        restartButton.style.display = "none";
        watermark.style.display = "none";
        rewardScreen.style.display = "none";

        gameOver = false;
        win = false;
        score = 0;
        objectsArray = [];
        resize();
        updateCharacterPosition();
        spawnObjectsContinuously();
        if (deviceType === "mobile") {
          showButtons();
        }
        break;
      case "game_over":
        startButton.style.display = "none";
        gameLogo.style.display = "none";
        canvas.style.display = "none";
        restartButton.style.display = "block";
        watermark.style.display = "flex";
        rewardScreen.style.display = "none";

        hideButtons();
        break;
      case "win":
        startButton.style.display = "none";
        gameLogo.style.display = "none";
        canvas.style.display = "none";
        restartButton.style.display = "none";
        watermark.style.display = "flex";
        rewardScreen.style.display = "flex";

        hideButtons();
        shuffleArray(rewards);

        document
          .querySelectorAll("#rewardScreen .card")
          .forEach((card, index) => {
            card.dataset.reward = index;
            card.innerText = "?";
            card.style.pointerEvents = "auto";
          });
        break;
    }
    garageUp();
  });
}

function garageDown(callback) {
  let position = -100;
  const interval = setInterval(() => {
    if (position >= 0) {
      clearInterval(interval);
      if (callback) callback();
    } else {
      position += 5;
      garage.style.transform = `translateY(${position}%)`;
    }
  }, 30);
}

function garageUp() {
  let position = 0;
  const interval = setInterval(() => {
    if (position <= -100) {
      clearInterval(interval);
    } else {
      position -= 5;
      garage.style.transform = `translateY(${position}%)`;
    }
  }, 30);
}

startButton.addEventListener("click", () => {
  changeScene("game");
});

restartButton.addEventListener("click", () => {
  changeScene("game");
});

function revealReward(card) {
  document.querySelectorAll("#rewardScreen .card").forEach((c) => {
    c.style.pointerEvents = "none";
  });

  const rewardIndex = parseInt(card.dataset.reward, 10);
  const reward = rewards[rewardIndex];
  card.innerText = reward;

  card.style.fontSize = "1.5rem";

  setTimeout(() => {
    location.reload();
  }, 2000);
}

document.querySelectorAll("#rewardScreen .card").forEach((card) => {
  card.addEventListener("click", () => {
    revealReward(card);
  });
});
