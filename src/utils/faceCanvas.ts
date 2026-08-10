// 얼굴 이미지 위에 HP 상태에 따른 2D 격투 상처 오버레이 캔버스 합성 유틸리티

export function generateDamagedFaceCanvas(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  hp: number
): string {
  const canvas = document.createElement('canvas');
  const width = 400;
  const height = 400;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. 원본 얼굴 그리기 (클리핑 및 둥근 마스크)
  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width / 2 - 10, 0, Math.PI * 2);
  ctx.clip();

  // 원본 이미지 센터 크롭 draw
  ctx.drawImage(sourceImage, 0, 0, width, height);

  // 2. HP에 따른 실시간 상처 필터 및 오버레이 렌더링
  const damageFactor = (100 - hp) / 100; // 0 (깨끗함) ~ 1 (피범벅 KO 직전)

  if (hp < 100) {
    // A. 피격 붉은 톤/어두움 가공
    if (hp <= 30) {
      ctx.fillStyle = `rgba(180, 20, 20, ${0.15 + damageFactor * 0.15})`;
      ctx.fillRect(0, 0, width, height);
    } else if (hp <= 60) {
      ctx.fillStyle = `rgba(120, 30, 80, ${0.1 + damageFactor * 0.1})`;
      ctx.fillRect(0, 0, width, height);
    }

    // B. 멍 (Bruises) - 눈가, 뺨
    if (hp <= 90) {
      // 오른쪽 뺨 멍
      drawBruise(ctx, width * 0.62, height * 0.48, 25, 'rgba(75, 0, 110, 0.4)');
    }
    if (hp <= 70) {
      // 왼쪽 눈 주변 붓기/멍
      drawBruise(ctx, width * 0.38, height * 0.38, 32, 'rgba(50, 10, 90, 0.55)');
      drawBruise(ctx, width * 0.38, height * 0.38, 20, 'rgba(120, 20, 20, 0.4)');
    }
    if (hp <= 40) {
      // 오른쪽 눈 주변 멍
      drawBruise(ctx, width * 0.65, height * 0.38, 30, 'rgba(80, 0, 120, 0.6)');
      // 턱 멍
      drawBruise(ctx, width * 0.5, height * 0.72, 35, 'rgba(60, 20, 100, 0.5)');
    }

    // C. 밴드에이드 / 반창고 (Bandages)
    if (hp <= 80) {
      // 왼쪽 뺨 반창고
      drawBandage(ctx, width * 0.32, height * 0.58, 42, 14, -20);
    }
    if (hp <= 50) {
      // 이마 반창고
      drawBandage(ctx, width * 0.52, height * 0.22, 50, 16, 15);
    }
    if (hp <= 20) {
      // 콧등 반창고
      drawBandage(ctx, width * 0.5, height * 0.46, 45, 15, 0);
    }

    // D. 피자국 및 스크래치 (Blood & Scratches)
    if (hp <= 85) {
      // 볼 가벼운 스크래치
      drawScratch(ctx, width * 0.6, height * 0.52, 35, 'rgba(180, 10, 10, 0.8)');
    }
    if (hp <= 60) {
      // 입술 끝 피
      drawBloodDrip(ctx, width * 0.56, height * 0.62, 22, 'rgba(190, 0, 0, 0.85)');
    }
    if (hp <= 30) {
      // 이마 피 흘림
      drawBloodDrip(ctx, width * 0.42, height * 0.25, 45, 'rgba(160, 0, 0, 0.9)');
      // 코피 자국
      drawBloodDrip(ctx, width * 0.49, height * 0.5, 30, 'rgba(200, 0, 0, 0.95)');
    }
    if (hp <= 10) {
      // 극심한 피범벅
      drawBloodSplatter(ctx, width * 0.5, height * 0.45);
    }
  }

  // 3. 외곽 링 테두리 그리기 (격투 체력 프레임)
  ctx.restore();

  ctx.lineWidth = 10;
  if (hp > 60) {
    ctx.strokeStyle = '#22c55e'; // Green
  } else if (hp > 30) {
    ctx.strokeStyle = '#eab308'; // Yellow
  } else {
    ctx.strokeStyle = '#ef4444'; // Red
  }
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width / 2 - 5, 0, Math.PI * 2);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

// 멍 그리기
function drawBruise(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// 반창고 그리기
function drawBandage(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, angleDeg: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((angleDeg * Math.PI) / 180);

  // 반창고 몸체 (연베이지)
  ctx.fillStyle = '#f5d6a7';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 6);
  ctx.fill();

  // 중앙 거즈 패드
  ctx.fillStyle = '#e3bd8c';
  ctx.fillRect(-w / 5, -h / 2, w / 2.5, h);

  // 구멍 점 찍기
  ctx.fillStyle = '#c79d67';
  for (let i = -w / 2 + 4; i < w / 2 - 4; i += 8) {
    ctx.fillRect(i, -1, 2, 2);
  }

  ctx.restore();
}

// 스크래치 상처
function drawScratch(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + length * 0.7, y + length * 0.4);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + 5, y - 4);
  ctx.lineTo(x + length * 0.7 + 5, y + length * 0.4 - 4);
  ctx.stroke();

  ctx.restore();
}

// 피 흘림 (Blood drip)
function drawBloodDrip(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(100, 0, 0, 0.5)';
  ctx.shadowBlur = 3;

  ctx.beginPath();
  ctx.moveTo(x - 2, y);
  ctx.lineTo(x + 2, y);
  ctx.lineTo(x + 3, y + length);
  ctx.arc(x, y + length, 4, 0, Math.PI);
  ctx.lineTo(x - 3, y);
  ctx.fill();

  ctx.restore();
}

// 피범벅 효과
function drawBloodSplatter(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(180, 0, 0, 0.75)';

  for (let i = 0; i < 12; i++) {
    const rx = centerX + (Math.random() - 0.5) * 180;
    const ry = centerY + (Math.random() - 0.5) * 180;
    const r = Math.random() * 8 + 3;

    ctx.beginPath();
    ctx.arc(rx, ry, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
