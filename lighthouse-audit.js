const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');

// File containing the list of URLs
const urlFile = 'urls.txt';
// Output folder for the Lighthouse reports
const outputFolder = 'lighthouse-reports';
// Report format
const reportFormat = 'html';
// Audit preset (choose 'mobile' or 'desktop')
const auditPreset = 'desktop';

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Function to show a loading indicator (dots)
function showLoadingIndicator() {
  const spinner = ['◐', '◓', '◑', '◒'];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r└ Auditing ${spinner[i]}`);
    i = (i + 1) % spinner.length;
  }, 500);
  return interval;
}

// Function to stop the loading indicator
function stopLoadingIndicator(interval) {
  clearInterval(interval);
  process.stdout.write('\r├ Done!             \n'); // Clear loading indicator and show 'Done!'
}

// Function to run Lighthouse audit for a single URL with preset toggle
async function runLighthouse(url, index) {
  const sanitizedUrl = url.replace(/https?:\/\//, '').replace(/[\/:]/g, '_');
  const date = new Date().toISOString().split('T')[0];
  const reportPath = path.join(outputFolder, `report-${sanitizedUrl}-${date}.${reportFormat}`);
  
  const lighthouseCommand = `lighthouse`;
  const lighthouseArgs = [
    url,
    `--output=${reportFormat}`,
    `--output-path=${reportPath}`,
    `--chrome-flags="--ignore-certificate-errors --headless"`, // headless mode
    `--preset=${auditPreset}` // Using preset for mobile or desktop
  ];

  console.log(`Starting Lighthouse audit for ${url} with ${auditPreset} preset...`);
  
  const loadingIndicator = showLoadingIndicator(); // Show loading indicator while audit runs

  return new Promise((resolve, reject) => {
    // Start the Lighthouse process
    const lighthouseProcess = spawn(lighthouseCommand, lighthouseArgs, { shell: true });

    // Wait for the process to complete
    lighthouseProcess.on('close', (code) => {
      stopLoadingIndicator(loadingIndicator); // Stop the loading indicator when done

      if (code === 0) {
        console.log(`✔ Lighthouse audit for ${url} completed successfully!\n└ Report saved to ${reportPath}\n`);
        resolve();
      } 
      else {
        console.error(`✗ Lighthouse audit for ${url} failed with exit code ${code}`);
        reject(new Error(`Lighthouse process exited with code ${code}`));
      }
    });
  });
}

// Main function to read URLs and run audits consecutively
async function runAuditsConsecutively() {
  const data = fs.readFileSync(urlFile, 'utf8');
  const urls = data.split('\n').filter(Boolean);
  
  for (let i = 0; i < urls.length; i++) {
    try {
      await runLighthouse(urls[i], i);
    } catch (error) {
      console.error(`Failed to complete Lighthouse audit for ${urls[i]}: ${error.message}`);
    }
  }
}

runAuditsConsecutively();