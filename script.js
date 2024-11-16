const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const images = [
  'pic.webp', // آدرس عکس اول
  'jungle.jpeg' // آدرس عکس دوم
];

let currentIndex = 0;
let particles = [];
let isTransitioning = false;

// تنظیم اندازه بوم
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

// بارگذاری و نمایش تصویر
function loadImage(index, callback) {
  const image = new Image();
  image.src = images[index];
  image.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
    const x = (canvas.width / 2) - (image.width / 2) * scale;
    const y = (canvas.height / 2) - (image.height / 2) * scale;
    ctx.drawImage(image, x, y, image.width * scale, image.height * scale);

    // ذخیره داده‌های تصویر برای افکت
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    particles = [];

    for (let y = 0; y < imageData.height; y += 3) {
      for (let x = 0; x < imageData.width; x += 3) {
        const index = (y * imageData.width + x) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];

        if (a > 0) {
          particles.push({
            x: Math.random() * canvas.width, // موقعیت اولیه تصادفی
            y: Math.random() * canvas.height, // موقعیت اولیه تصادفی
            targetX: x, // موقعیت هدف برای تصویر جدید
            targetY: y, // موقعیت هدف برای تصویر جدید
            r: r,
            g: g,
            b: b,
            a: 0, // شفافیت اولیه برای افکت فید-این
            finalA: a // شفافیت نهایی
          });
        }
      }
    }

    if (callback) callback();
  };
}

// افکت پودر شدن و ساخت تصویر جدید با فید-این
function transitionToNextImage() {
  isTransitioning = true;
  const startTime = Date.now();
  const duration = 3; // مدت زمان انیمیشن (به ثانیه)

  function animateTransition() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let elapsedTime = (Date.now() - startTime) / 1000; // زمان گذشته بر حسب ثانیه
    let progress = Math.min(elapsedTime / duration, 1); // پیشرفت انیمیشن (بین 0 و 1)

    particles.forEach(particle => {
      // حرکت ذرات به سمت موقعیت هدف با استفاده از پیشرفت انیمیشن
      particle.x += (particle.targetX - particle.x) * 0.05 * (1 - progress); // حرکت نرم‌تر
      particle.y += (particle.targetY - particle.y) * 0.05 * (1 - progress); // حرکت نرم‌تر

      // افزایش شفافیت برای فید-این
      particle.a = Math.min(particle.finalA * progress, 50);

      ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.a / 255})`;
      ctx.fillRect(particle.x, particle.y, 2, 2);
    });

    if (progress < 1) {
      requestAnimationFrame(animateTransition);
    } else {
      isTransitioning = false;
      currentIndex = (currentIndex + 1) % images.length; // عکس بعدی
      loadImage(currentIndex); // بارگذاری تصویر جدید
    }
  }

  // بارگذاری تصویر بعدی و شروع انیمیشن
  loadImage((currentIndex + 1) % images.length, animateTransition);
}

// دکمه‌های قبلی و بعدی
document.getElementById('prev').addEventListener('click', () => {
  if (!isTransitioning) {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    loadImage(currentIndex);
  }
});

document.getElementById('next').addEventListener('click', () => {
  if (!isTransitioning) {
    transitionToNextImage(); // اجرای افکت انتقال به عکس بعدی
  }
});

// بارگذاری تصویر اولیه
loadImage(currentIndex);
