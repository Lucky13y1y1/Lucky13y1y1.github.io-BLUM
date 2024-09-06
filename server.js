const express = require('express');
const app = express();
const port = 3000;
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

app.use(express.json());

app.post('/start-automation', async (req, res) => {
  const { queryIds, shouldPerformTasks, threadCount } = req.body;

  const threadCountInput = Math.min(Math.max(parseInt(threadCount) || 1, 1), queryIds.length);

  console.log(`Using ${threadCountInput} threads for processing.`);

  async function runWorker(queryId, threadNumber) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: { queryId, shouldPerformTasks, threadNumber },
      });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }

  async function processInBatches() {
    for (let i = 0; i < queryIds.length; i += threadCountInput) {
      const batch = queryIds.slice(i, i + threadCountInput);
      await Promise.all(
        batch.map((queryId, index) => runWorker(queryId, i + index + 1))
      );
    }
  }

  try {
    await processInBatches();
    res.status(200).send('Automation started successfully.');
  } catch (error) {
    res.status(500).send('Error starting automation: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
