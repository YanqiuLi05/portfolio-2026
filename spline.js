import { Application } from 'https://unpkg.com/@splinetool/runtime@1.9.98/build/runtime.js';

const canvas = document.getElementById('spline-canvas');
const app = new Application(canvas);

app.load('https://prod.spline.design/It6U3ZjKlRtooGB1/scene.splinecode')
  .then(() => {
    const lf = document.getElementById('lf');
    const ldr = document.getElementById('ldr');
    const lpct = document.getElementById('lpct');

    if (lf) lf.style.width = '100%';
    if (lpct) lpct.textContent = '100';

    setTimeout(() => {
      if (ldr) ldr.classList.add('gone');
    }, 350);

    if (typeof window.buildAnn === 'function') {
      try {
        window.buildAnn();
      } catch (e) {
        console.error('buildAnn error:', e);
      }
    }

    if (typeof window.removeWatermark === 'function') {
      try {
        window.removeWatermark();
      } catch (e) {
        console.error('removeWatermark error:', e);
      }
    }
  })
  .catch((err) => {
    console.error('Spline load failed:', err);
    const ldr = document.getElementById('ldr');
    if (ldr) ldr.classList.add('gone');
  });