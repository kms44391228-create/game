// Procedural Canvas Facial Damage Rendering Engine
// Renders comic & funny combat injuries (cross band-aids, giant forehead bumps, missing teeth,
// funny mustache marker doodles, pig nose swelling, and dizzy X_X eyes)

export function renderDamagedFace(
  faceImgUrl: string,
  hp: number,
  canvas: HTMLCanvasElement
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const damagePercent = Math.max(0, Math.min(100, 100 - hp));

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = faceImgUrl;

  img.onload = () => {
    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // 1. Draw original image
    ctx.drawImage(img, 0, 0, width, height);

    if (damagePercent <= 0) return; // Clean, no damage

    // Coordinates estimated based on center face
    const centerX = width / 2;
    const centerY = height / 2;
    const leftEyeX = width * 0.38;
    const rightEyeX = width * 0.62;
    const eyeY = height * 0.42;
    const cheekLeftX = width * 0.32;
    const cheekRightX = width * 0.68;
    const cheekY = height * 0.58;
    const noseX = centerX;
    const noseY = height * 0.58;
    const mouthX = width * 0.5;
    const mouthY = height * 0.72;
    const foreheadY = height * 0.28;

    // 2. Apply skin bruised tone shift (purple/dark red tint when damaged)
    if (damagePercent > 20) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.25, (damagePercent / 100) * 0.3);
      ctx.fillStyle = '#4a0011'; // Dark bruise purple-red
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 3. Cartoon Swollen Eyes / Black Eyes
    if (damagePercent >= 10) {
      // Swollen Left Eye
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(leftEyeX, eyeY, width * 0.1, height * 0.08, 0, 0, Math.PI * 2);
      const eyeGrad = ctx.createRadialGradient(leftEyeX, eyeY, 5, leftEyeX, eyeY, width * 0.12);
      eyeGrad.addColorStop(0, 'rgba(80, 0, 120, 0.75)');
      eyeGrad.addColorStop(0.6, 'rgba(180, 20, 80, 0.5)');
      eyeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = eyeGrad;
      ctx.fill();
      ctx.restore();
    }

    if (damagePercent >= 40) {
      // Swollen Right Eye
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(rightEyeX, eyeY, width * 0.12, height * 0.09, 0, 0, Math.PI * 2);
      const eyeGrad2 = ctx.createRadialGradient(rightEyeX, eyeY, 5, rightEyeX, eyeY, width * 0.14);
      eyeGrad2.addColorStop(0, 'rgba(90, 0, 120, 0.85)');
      eyeGrad2.addColorStop(0.7, 'rgba(200, 20, 50, 0.6)');
      eyeGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = eyeGrad2;
      ctx.fill();
      ctx.restore();
    }

    // 4. Funny Cute Cartoon Band-Aids (귀여운 X자 반창고)
    if (damagePercent >= 10) {
      // Cheek Band-Aid
      drawBandAid(ctx, cheekLeftX + 5, cheekY - 10, 32, 12, -0.3, '#fef08a'); // Yellow bandaid
      if (damagePercent >= 30) {
        // Forehead Cross Band-Aid
        drawBandAid(ctx, centerX + 15, foreheadY, 36, 13, 0.4, '#fbcfe8'); // Pink bandaid
        drawBandAid(ctx, centerX + 15, foreheadY, 36, 13, -0.6, '#fbcfe8');
      }
    }

    // 5. Giant Cartoon Forehead Lump/Bump (왕 혹) with spinning stars
    if (damagePercent >= 20) {
      ctx.save();
      const bumpX = centerX - 35;
      const bumpY = foreheadY - 25;
      ctx.beginPath();
      ctx.ellipse(bumpX, bumpY, 22, 16, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899'; // Bright Pink Bump
      ctx.shadowColor = '#831843';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.strokeStyle = '#9d174d';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Bump highlight
      ctx.beginPath();
      ctx.ellipse(bumpX - 6, bumpY - 5, 6, 3, -0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();

      // Little yellow stars around bump
      drawStar(ctx, bumpX - 22, bumpY - 12, 5, 8, 4, '#facc15');
      drawStar(ctx, bumpX + 20, bumpY - 10, 5, 7, 3, '#facc15');
      if (damagePercent >= 50) {
        drawStar(ctx, bumpX, bumpY - 22, 5, 9, 4, '#38bdf8');
      }
      ctx.restore();
    }

    // 6. Funny Clown/Pig Red Swollen Nose (딸기코/왕코)
    if (damagePercent >= 30) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(noseX, noseY, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; // Red Nose
      ctx.shadowColor = '#991b1b';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Nose Shine Spot
      ctx.beginPath();
      ctx.arc(noseX - 4, noseY - 5, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      ctx.restore();
    }

    // 7. Funny Missing Front Tooth (빠진 이빨/영구치)
    if (damagePercent >= 40) {
      ctx.save();
      // Black gap over center mouth
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(mouthX - 8, mouthY - 3, 16, 12);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1.5;
      // Surrounding teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(mouthX - 18, mouthY - 3, 8, 10);
      ctx.strokeRect(mouthX - 18, mouthY - 3, 8, 10);
      ctx.fillRect(mouthX + 10, mouthY - 3, 8, 10);
      ctx.strokeRect(mouthX + 10, mouthY - 3, 8, 10);
      ctx.restore();
    }

    // 8. Marker Doodle Graffiti: Curly Mustache & "바보" (낙서 공격!)
    if (damagePercent >= 50) {
      ctx.save();
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';

      // Silly Curly Mustache (웃긴 콧수염)
      ctx.beginPath();
      ctx.moveTo(mouthX, mouthY - 12);
      ctx.quadraticCurveTo(mouthX - 18, mouthY - 20, mouthX - 30, mouthY - 10);
      ctx.quadraticCurveTo(mouthX - 35, mouthY - 2, mouthX - 25, mouthY - 4);

      ctx.moveTo(mouthX, mouthY - 12);
      ctx.quadraticCurveTo(mouthX + 18, mouthY - 20, mouthX + 30, mouthY - 10);
      ctx.quadraticCurveTo(mouthX + 35, mouthY - 2, mouthX + 25, mouthY - 4);
      ctx.stroke();
      ctx.restore();
    }

    if (damagePercent >= 65) {
      ctx.save();
      // Funny forehead / cheek doodle "바보" (Fool) or cat whiskers
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText('바보', cheekRightX - 10, cheekY - 5);
      ctx.fillText('바보', cheekRightX - 10, cheekY - 5);

      // Cat Whiskers on left cheek
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 2.5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cheekLeftX - 15, cheekY + i * 8);
        ctx.lineTo(cheekLeftX - 45, cheekY + i * 12);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. Dizzy Cartoon Spiral / X_X Eyes on KO Danger
    if (damagePercent >= 80) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';

      // Left Eye X
      ctx.beginPath();
      ctx.moveTo(leftEyeX - 14, eyeY - 14);
      ctx.lineTo(leftEyeX + 14, eyeY + 14);
      ctx.moveTo(leftEyeX + 14, eyeY - 14);
      ctx.lineTo(leftEyeX - 14, eyeY + 14);
      ctx.stroke();

      // Right Eye X
      ctx.beginPath();
      ctx.moveTo(rightEyeX - 14, eyeY - 14);
      ctx.lineTo(rightEyeX + 14, eyeY + 14);
      ctx.moveTo(rightEyeX + 14, eyeY - 14);
      ctx.lineTo(rightEyeX - 14, eyeY + 14);
      ctx.stroke();

      // Dizzy Swirl over head
      drawDizzySpiral(ctx, centerX, foreheadY - 45, 20);

      ctx.restore();
    }
  };
}

// Helper: Draw Cartoon Band-Aid
function drawBandAid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  angle: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Bandage base
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 6);
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 4;
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Center pad
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-w / 6, -h / 2 + 1, w / 3, h - 2);

  // Cross stitching / dots
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-w / 3, 0, 2, 2);
  ctx.fillRect(w / 3 - 2, 0, 2, 2);

  ctx.restore();
}

// Helper: Draw Star
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  color: string
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Helper: Draw Dizzy Spiral
function drawDizzySpiral(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  ctx.beginPath();
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  for (let i = 0; i < 30; i++) {
    const angle = 0.4 * i;
    const r = (radius / 30) * i;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// Generate default procedural futuristic AI Fighter Face when user hasn't uploaded photo
export function generateDefaultAiFace(canvas: HTMLCanvasElement, name: string = 'AI CYBER TITAN') {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // Cyberpunk Robot Head Canvas
  ctx.fillStyle = '#12121e';
  ctx.fillRect(0, 0, w, h);

  // Background Grid
  ctx.strokeStyle = '#2d1b4e';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Head Silhouette
  ctx.fillStyle = '#1e1b2e';
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.25, h * 0.2);
  ctx.lineTo(w * 0.75, h * 0.2);
  ctx.lineTo(w * 0.85, h * 0.5);
  ctx.lineTo(w * 0.65, h * 0.85);
  ctx.lineTo(w * 0.35, h * 0.85);
  ctx.lineTo(w * 0.15, h * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glowing Visor / Eyes
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 15;
  ctx.fillRect(w * 0.25, h * 0.4, w * 0.5, h * 0.08);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(w * 0.3, h * 0.42, w * 0.1, h * 0.04);
  ctx.fillRect(w * 0.6, h * 0.42, w * 0.1, h * 0.04);
  ctx.shadowBlur = 0;

  // Mouth vent
  ctx.fillStyle = '#0f172a';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(w * 0.4, h * 0.65 + i * 8, w * 0.2, 4);
  }

  // Label
  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(name, w / 2, h * 0.93);
}

