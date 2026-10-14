import confetti from 'canvas-confetti';

export function fireSuccessConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    console.log('Confetti failed', e);
  }
}
