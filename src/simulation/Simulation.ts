import p5 from 'p5';
import type { RenderMode, SimulationConfig } from '../types';

class Particle {
  p: p5;
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  target: p5.Vector;
  teamId: number;
  persona: {
    shape: 'circle' | 'square' | 'triangle';
    speed: number;
    mobility: number;
  };
  color: p5.Color;
  inMeeting: boolean = false;
  meetingTimer: number = 0;

  constructor(p: p5, teamId: number, color: p5.Color) {
    this.p = p;
    this.teamId = teamId;
    this.color = color;
    this.pos = p.createVector(p.random(p.width), p.random(p.height));
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.target = this.pos.copy();

    const personas: Array<Particle['persona']> = [
      { shape: 'circle', speed: 1.5, mobility: 0.8 },
      { shape: 'square', speed: 0.5, mobility: 0.2 },
      { shape: 'triangle', speed: 2.5, mobility: 1.2 },
    ];
    this.persona = p.random(personas);
  }

  update(collaborationSpace: number, meetingPoint?: p5.Vector) {
    if (collaborationSpace === 0) {
      this.vel.mult(0);
      return;
    }

    if (meetingPoint && !this.inMeeting) {
      if (this.p.random(100) < 1) { // Probability to join meeting
        this.inMeeting = true;
        this.meetingTimer = this.p.random(100, 300);
      }
    }

    if (this.inMeeting && meetingPoint) {
      const force = p5.Vector.sub(meetingPoint, this.pos);
      const d = force.mag();
      if (d > 5) {
        force.setMag(0.1);
        this.acc.add(force);
      } else {
        this.vel.mult(0.9); // Settle down at meeting point
      }
      this.meetingTimer--;
      if (this.meetingTimer <= 0) this.inMeeting = false;
    } else {
      // Random wandering based on mobility
      if (this.p.random(1) < 0.01 * this.persona.mobility) {
        this.target = this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height));
      }
      const steer = p5.Vector.sub(this.target, this.pos);
      steer.setMag(0.05 * this.persona.speed);
      this.acc.add(steer);
    }

    this.vel.add(this.acc);
    this.vel.limit(this.persona.speed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Boundary check
    if (this.pos.x < 0 || this.pos.x > this.p.width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > this.p.height) this.vel.y *= -1;
  }

  draw(mode: RenderMode) {
    this.p.push();
    this.p.translate(this.pos.x, this.pos.y);
    this.p.noStroke();
    
    let alpha = 200;
    let sizeMultiplier = mode === 'Cloud' ? 3 : 1;
    if (mode === 'Cloud') alpha = 50;
    
    const c = this.color;
    this.p.fill(this.p.red(c), this.p.green(c), this.p.blue(c), alpha);

    switch (this.persona.shape) {
      case 'circle':
        this.p.circle(0, 0, 6 * sizeMultiplier);
        break;
      case 'square':
        this.p.rectMode(this.p.CENTER);
        this.p.rect(0, 0, 5 * sizeMultiplier, 5 * sizeMultiplier);
        break;
      case 'triangle':
        this.p.triangle(-4 * sizeMultiplier, 4 * sizeMultiplier, 4 * sizeMultiplier, 4 * sizeMultiplier, 0, -4 * sizeMultiplier);
        break;
    }
    this.p.pop();
  }
}

export class Simulation {
  p: p5;
  config: SimulationConfig;
  particles: Particle[] = [];
  meetingPoints: p5.Vector[] = [];
  offscreen: p5.Graphics;

  constructor(p: p5, config: SimulationConfig) {
    this.p = p;
    this.config = config;
    this.offscreen = p.createGraphics(p.width, p.height);
    this.init();
  }

  init() {
    this.p.randomSeed(this.config.randomSeed);
    this.particles = [];
    
    const teamColors = Array.from({ length: this.config.teamCount }, () => 
      this.p.color(this.p.random(100, 255), this.p.random(100, 255), this.p.random(100, 255))
    );

    const teamSizes = this.allocateTeams(this.config.headcount, this.config.teamCount);
    
    for (let t = 0; t < this.config.teamCount; t++) {
      for (let i = 0; i < teamSizes[t]; i++) {
        this.particles.push(new Particle(this.p, t, teamColors[t]));
      }
    }

    this.meetingPoints = Array.from({ length: 5 }, () => 
      this.p.createVector(this.p.random(this.p.width * 0.2, this.p.width * 0.8), this.p.random(this.p.height * 0.2, this.p.height * 0.8))
    );
    this.offscreen.clear(0, 0, 0, 0);
  }

  allocateTeams(total: number, count: number): number[] {
    let remaining = total;
    const sizes = [];
    for (let i = 0; i < count - 1; i++) {
      const size = Math.max(1, Math.floor(this.p.random(1, remaining / (count - i) * 2)));
      sizes.push(size);
      remaining -= size;
    }
    sizes.push(Math.max(1, remaining));
    return sizes;
  }

  update(config: SimulationConfig) {
    this.config = config;
    
    this.particles.forEach(part => {
      let meeting: p5.Vector | undefined;
      if (this.p.random(100) < this.config.collaborationSpace) {
        meeting = this.meetingPoints[Math.floor(this.p.random(this.meetingPoints.length))];
      }
      part.update(this.config.collaborationSpace, meeting);
    });

    // Cross-team interaction trails
    if (this.config.collaborationSpace > 0) {
      this.offscreen.strokeWeight(0.5);
      for (let i = 0; i < this.particles.length; i += 2) { // Optimization: check fewer pairs
        for (let j = i + 1; j < this.particles.length; j += 2) {
          const p1 = this.particles[i];
          const p2 = this.particles[j];
          if (p1.teamId !== p2.teamId) {
            const d = p5.Vector.dist(p1.pos, p2.pos);
            if (d < 40 * (this.config.collaborationSpace / 100)) {
              this.offscreen.stroke(255, 255, 255, 10);
              this.offscreen.line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
            }
          }
        }
      }
    }
  }

  draw() {
    this.p.background(10, 10, 15);
    
    // Draw persistence trails
    this.p.image(this.offscreen, 0, 0);

    // Fade offscreen over time
    this.offscreen.background(0, 0, 0, 1);

    if (this.config.renderMode === 'Wave') {
      this.drawWave();
    }

    this.particles.forEach(part => {
      this.applyLayoutConstraints(part);
      part.draw(this.config.renderMode);
      
      if (this.config.renderMode === 'Dense') {
        this.p.noFill();
        this.p.stroke(this.p.red(part.color), this.p.green(part.color), this.p.blue(part.color), 30);
        this.p.circle(part.pos.x, part.pos.y, 15 + this.p.sin(this.p.frameCount * 0.1) * 5);
      }
    });

    if (this.config.renderMode === 'Stock') {
      this.drawStockUI();
    }
  }

  applyLayoutConstraints(part: Particle) {
    if (this.config.layout === 'Cellular') {
      const cellSize = 100;
      const targetX = Math.floor(part.pos.x / cellSize) * cellSize + cellSize / 2;
      const targetY = Math.floor(part.pos.y / cellSize) * cellSize + cellSize / 2;
      part.pos.x = this.p.lerp(part.pos.x, targetX, 0.05);
      part.pos.y = this.p.lerp(part.pos.y, targetY, 0.05);
    } else if (this.config.layout === 'Cubicles') {
      const gridSize = 40;
      part.pos.x = this.p.lerp(part.pos.x, Math.round(part.pos.x / gridSize) * gridSize, 0.1);
      part.pos.y = this.p.lerp(part.pos.y, Math.round(part.pos.y / gridSize) * gridSize, 0.1);
    }
  }

  drawWave() {
    this.p.noFill();
    this.p.stroke(100, 150, 255, 20);
    for (let y = 0; y < this.p.height; y += 30) {
      this.p.beginShape();
      for (let x = 0; x < this.p.width; x += 30) {
        let offset = 0;
        this.particles.forEach((part, idx) => {
          if (idx % 4 === 0) { // Optimization
            const d = this.p.dist(x, y, part.pos.x, part.pos.y);
            if (d < 100) offset += this.p.map(d, 0, 100, 20, 0);
          }
        });
        this.p.vertex(x, y + this.p.sin(x * 0.01 + this.p.frameCount * 0.05) * offset * 0.5);
      }
      this.p.endShape();
    }
  }

  drawStockUI() {
    this.p.stroke(0, 255, 100, 50);
    this.p.line(0, this.p.mouseY, this.p.width, this.p.mouseY);
    this.p.fill(0, 255, 100, 150);
    this.p.textSize(10);
    this.p.text(`INDEX: ${Math.floor(this.p.frameCount * 0.1)}`, 10, this.p.mouseY - 5);
  }
}
