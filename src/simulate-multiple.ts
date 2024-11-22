import workerpool from "workerpool";
import {heavyTask} from "./heavy-task";
import {runSimulation} from "./simulate";
const pool = workerpool.pool();

async function runTasks() {
  const results = await Promise.all([
    // pool.exec(runSimulation, [1]),
    pool.exec(heavyTask, [2]),
    // pool.exec(heavyTask, [3]),
    // pool.exec(heavyTask, [4]),
  ]);

  console.log(results); // Process results
  pool.terminate(); // Close the pool
}

runTasks();
