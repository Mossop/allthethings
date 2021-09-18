import { setTimeout, clearTimeout } from "timers";

import type { Awaitable } from "#utils";
import { waitFor } from "#utils";

type Task<R = void> = () => Awaitable<R>;

const MIN_DELAY = 1000;

export class TaskManager {
  private timer: NodeJS.Timeout | null = null;
  private nextTask: Task | null = null;

  private tasks: Map<Task, number> = new Map();
  private runningTask = false;

  private queueNextTask(): void {
    if (this.runningTask) {
      return;
    }
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.nextTask = null;
    }
    let nextTime = Number.MAX_SAFE_INTEGER;
    for (let [task, time] of this.tasks.entries()) {
      if (time < nextTime) {
        nextTime = time;
        this.nextTask = task;
      }
    }
    if (this.nextTask) {
      let delay = Math.max(nextTime - Date.now(), MIN_DELAY);
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.nextTask) {
          let task = this.nextTask;
          this.nextTask = null;
          this.tasks.delete(task);
          this.runningTask = true;
          waitFor(task()).finally(() => {
            this.runningTask = false;
            this.queueNextTask();
          });
        } else {
          this.queueNextTask();
        }
      }, delay);
    }
  }

  public queueTask(task: Task, delay: number = 0): void {
    this.tasks.set(task, Date.now() + delay);
    this.queueNextTask();
  }

  public queueRecurringTask(task: Task<number>, delay: number = 0): void {
    this.queueTask(async (): Promise<void> => {
      let nextDelay = await waitFor(task());
      if (nextDelay >= 0) {
        this.queueRecurringTask(task, nextDelay);
      }
    }, delay);
  }
}

export default new TaskManager();
