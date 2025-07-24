// When the page finishes loading, start the bubble animations
document.addEventListener('DOMContentLoaded', function () {
  // Select all elements with the class 'bubble'
  const bubbles = document.querySelectorAll('.bubble');

  // For each bubble, assign a random animation delay between 0 and 5 seconds
  bubbles.forEach((bubble) => {
    const randomDelay = Math.random() * 5; // random delay in seconds
    bubble.style.animationDelay = `${randomDelay}s`;
  });
});
