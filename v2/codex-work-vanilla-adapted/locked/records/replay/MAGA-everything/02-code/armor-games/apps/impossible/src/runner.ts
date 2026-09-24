/** Deterministic 120 Hz runner. Drawing/audio never affect collision. */
import { COURSES, type Course } from './courses.ts';
export { COURSES, LEVEL, LEVEL_END, CHECKPOINTS } from './courses.ts';
export type { Course, Obstacle } from './courses.ts';
export const DT = 1 / 120, SPEED = 360, GRAV = 2600, JUMP_V = 880;
export const CUBE = 34, GROUND_Y = 430;
export class Runner {
  courseIndex = 0;
  get course(): Course { return COURSES[this.courseIndex]; }
  x = 0; y = GROUND_Y - CUBE; vy = 0; grounded = true; rot = 0;
  state: 'running' | 'dead' | 'clear' = 'running';
  attempt = 1; deaths = 0; checkpoint = 0; time = 0;
  jumpBuffer = 0; coyote = 0; deadTime = 0;
  practice = false;
  reset(full = false): void {
    if (full) { this.attempt = 0; this.deaths = 0; this.checkpoint = 0; }
    this.attempt++; this.x = this.practice ? this.checkpoint : 0;
    this.y = GROUND_Y - CUBE; this.vy = 0; this.grounded = true; this.rot = 0;
    this.jumpBuffer = this.coyote = this.deadTime = 0; this.time = this.x / SPEED;
    this.state = 'running';
  }
  jump(): void { this.jumpBuffer = .1; }
  die(): void { this.state = 'dead'; this.deadTime = 0; this.deaths++; }
  floorAt(x: number): number {
    let floor = GROUND_Y;
    for (const [kind, ox, w, h] of this.course.obstacles) {
      if (kind === 'block' && x + CUBE / 2 > ox && x - CUBE / 2 < ox + w) {
        floor = Math.min(floor, GROUND_Y - h!);
        continue;
      }
      if (x < ox || x > ox + w) continue;
      if (kind === 'gap') floor = -Infinity;
      if (kind === 'block') floor = Math.min(floor, GROUND_Y - h!);
    }
    return floor;
  }
  step(dt = DT): 'jump' | 'death' | 'clear' | 'land' | undefined {
    if (this.state === 'dead') { this.deadTime += dt; if (this.deadTime >= .16) this.reset(); return; }
    if (this.state === 'clear') return;
    this.time += dt; this.x += SPEED * dt;
    const floor = this.floorAt(this.x + CUBE / 2);
    let event: 'jump' | 'land' | undefined;
    if (this.grounded) {
      if (floor === -Infinity || this.y + CUBE < floor - 1) { this.grounded = false; this.coyote = .06; }
    } else {
      this.coyote = Math.max(0, this.coyote - dt);
      const prevBottom = this.y + CUBE;
      this.vy += GRAV * dt; this.y += this.vy * dt;
      if (floor > -Infinity && this.vy >= 0 && prevBottom <= floor + 2 && this.y + CUBE >= floor) {
        this.y = floor - CUBE; this.vy = 0; this.grounded = true;
        this.rot = Math.round(this.rot / (Math.PI / 2)) * Math.PI / 2; event = 'land';
      }
    }
    if (!this.grounded) this.rot += dt * 4.2;
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    if (this.jumpBuffer > 0 && (this.grounded || this.coyote > 0)) {
      this.vy = -JUMP_V; this.grounded = false; this.coyote = this.jumpBuffer = 0; event = 'jump';
    }
    for (const [kind, ox, w, h] of this.course.obstacles) {
      const hit = kind === 'spike'
        ? this.x + CUBE / 2 > ox + 4 && this.x + CUBE / 2 < ox + w - 4 && this.y + CUBE > GROUND_Y - 26
        : kind === 'block' && this.x + CUBE > ox && this.x < ox + w && this.y + CUBE > GROUND_Y - h! + 2 && this.y < GROUND_Y;
      if (hit) { this.die(); return 'death'; }
    }
    if (floor === -Infinity && this.y + CUBE > GROUND_Y + 8) { this.die(); return 'death'; }
    if (this.practice && this.grounded) for (const cp of this.course.checkpoints) if (this.x >= cp) this.checkpoint = cp;
    if (this.x >= this.course.end) { this.state = 'clear'; return 'clear'; }
    return event;
  }
}
