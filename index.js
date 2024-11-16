const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const images = [
  "https://images.unsplash.com/photo-1728570084619-18eb2a94ed59?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzE3ODIwNjR8&ixlib=rb-4.0.3&q=85",
  "https://images.unsplash.com/photo-1728575908094-9583b51f936f?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzE3ODIwNjR8&ixlib=rb-4.0.3&q=85",
  "https://images.unsplash.com/photo-1728984273683-d962fd89ef4d?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MzE3ODIwNjR8&ixlib=rb-4.0.3&q=85"
];

let currentIndex = 0;
let particles = [];
let isTransitioning = false;
let direction = 1; // Direction of particle movement: 1 for forward, -1 for backward

// Set canvas size
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

// Load and display image
function loadImage(index, callback) {
  const image = new Image();
  image.crossOrigin = "anonymous"; // Ensure cross-origin access
  image.src = images[index];
  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(
      canvas.width / image.width,
      canvas.height / image.height
    );
    const x = canvas.width / 2 - (image.width / 2) * scale;
    const y = canvas.height / 2 - (image.height / 2) * scale;

    ctx.drawImage(image, x, y, image.width * scale, image.height * scale);

    // Store image data for effect
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    particles = [];

    // Increase spacing between pixels to reduce the number of particles
    for (let y = 0; y < imageData.height; y += 3) { // Increased spacing (6 pixels)
      for (let x = 0; x < imageData.width; x += 3) { // Increased spacing (6 pixels)
        const index = (y * imageData.width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];

        if (a > 0) {
          const angle = Math.atan2(y - canvas.height / 2, x - canvas.width / 2);
          const speed = Math.random() * 3 + 2; // Particle speed

          particles.push({
            x: x,
            y: y,
            velocityX: Math.cos(angle) * speed * direction, // Set X direction
            velocityY: Math.sin(angle) * speed * direction, // Set Y direction
            r: r,
            g: g,
            b: b,
            a: 255, // Initial opacity
            fade: Math.random() * 5 + 1 // Opacity fade rate
          });
        }
      }
    }

    if (callback) callback();
  };
}

// Effect for particles fading outward
function transitionToNextImage() {
  isTransitioning = true;
  const nextIndex = (currentIndex + direction + images.length) % images.length;
  const startTime = Date.now();
  const duration = 7; // Animation duration in seconds

  function animateTransition() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let elapsedTime = (Date.now() - startTime) / 1000; // Time elapsed in seconds
    let progress = Math.min(elapsedTime / duration, 1); // Animation progress (0 to 1)

    particles.forEach((particle) => {
      // Move particles outward
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;

      // Gradually fade particles
      particle.a -= particle.fade;
      if (particle.a < 0) particle.a = 1; // Prevent negative opacity

      ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${
        particle.a / 300
      })`;
      ctx.fillRect(particle.x, particle.y, 2, 2);
    });

    if (progress < 1) {
      requestAnimationFrame(animateTransition);
    } else {
      isTransitioning = false;
      currentIndex = nextIndex; // Update current image
      loadImage(currentIndex); // Load new image
    }
  }

  animateTransition();
}

// Previous and Next buttons
document.getElementById("prev").addEventListener("click", () => {
  if (!isTransitioning) {
    direction = -1; // Set direction to backward
    transitionToNextImage();
  }
});

document.getElementById("next").addEventListener("click", () => {
  if (!isTransitioning) {
    direction = 1; // Set direction to forward
    transitionToNextImage();
  }
});

// Load the initial image
loadImage(currentIndex);
