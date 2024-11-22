const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const csvWriter = require('csv-write-stream');

// Output folder for the Lighthouse reports
const outputFolder = 'lighthouse-reports';
// File containing the list of URLs
const urlFile = 'urls-otf.txt';
// Audit preset (choose 'mobile', 'desktop', or 'both')
const auditPreset = 'both';

// Create the main output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Create a subfolder with today's date in MMDDYY format
const todayDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '');
const dateOutputFolder = path.join(outputFolder, todayDate);

if (!fs.existsSync(dateOutputFolder)) {
  fs.mkdirSync(dateOutputFolder);
}

// Create CSV file with timestamped filename inside the date subfolder
const timestamp = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '') +
                  '-' +
                  new Date().toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '');
const csvFilePath = path.join(dateOutputFolder, `lighthouse-scores-${auditPreset}-${timestamp}.csv`);
const writer = csvWriter({ headers: ['URL', 'Preset', 'Performance', 'Accessibility', 'Best Practices', 'SEO'] });
writer.pipe(fs.createWriteStream(csvFilePath));

// Function to show a loading indicator (spinner) with the current URL being audited
function showLoadingIndicator(url) {
  const spinner = ['◐', '◓', '◑', '◒'];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r└ Auditing ${url} ${spinner[i]}`);
    i = (i + 1) % spinner.length;
  }, 500);
  return interval;
}

// Function to stop the loading indicator
function stopLoadingIndicator(interval) {
  clearInterval(interval);
  process.stdout.write('\x1b[2K\r├ Done!\n'); // Clear loading indicator and show 'Done!'
}

// Function to wait for the JSON file to exist, retrying up to a certain number of times
function waitForFile(filePath, maxRetries = 5, interval = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const reportFilePath = filePath.replace('.json', '.report.json');

    const checkFile = () => {
      fs.access(reportFilePath, fs.constants.F_OK, (err) => {
        if (!err) {
          resolve(reportFilePath);
        } else if (attempts < maxRetries) {
          attempts++;
          setTimeout(checkFile, interval);
        } else {
          reject(new Error(`File not found after ${maxRetries} attempts: ${reportFilePath}`));
        }
      });
    };

    checkFile();
  });
}

// Function to run Lighthouse audit for a single URL with a specific preset
async function runLighthouse(url, preset) {
  const sanitizedUrl = url.replace(/https?:\/\//, '').replace(/[\/:]/g, '_');
  
  // Create a compressed timestamp in MMDDYY-HHMMSS format
  const timestamp = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).replace(/\//g, '') +
                    '-' +
                    new Date().toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '');
  
  const reportPath = path.join(dateOutputFolder, `${preset}-${sanitizedUrl}-${timestamp}.json`);
  
  const lighthouseCommand = `lighthouse`;
  const lighthouseArgs = [
    url,
    `--output=json,html`,
    `--output-path=${reportPath}`,
    `--chrome-flags="--ignore-certificate-errors --headless"`
  ];

  // Add the preset flag
  if (preset === 'desktop') {
    lighthouseArgs.push(`--preset=desktop`);
  }

  console.log(`\nStarting Lighthouse audit for ${url} with ${preset} preset...`);
  
  const loadingIndicator = showLoadingIndicator(url); // Show loading indicator while audit runs

  return new Promise((resolve, reject) => {
    // Start the Lighthouse process
    const lighthouseProcess = spawn(lighthouseCommand, lighthouseArgs, { shell: true });

    // Wait for the process to complete
    lighthouseProcess.on('close', async (code) => {
      stopLoadingIndicator(loadingIndicator); // Stop the loading indicator when done

      if (code === 0) {
        console.log(`✔ Lighthouse audit for ${url} completed successfully!\n└ Report saved to ${reportPath}`);
        
        try {
          // Wait for the .report.json file to exist before reading
          const finalReportPath = await waitForFile(reportPath);

          // Read the JSON file and extract scores
          fs.readFile(finalReportPath, 'utf8', (err, data) => {
            if (err) {
              console.error(`Error reading JSON report for ${url}: ${err}`);
              reject(new Error(`Error reading JSON report`));
            } else {
              const report = JSON.parse(data);
              const scores = {
                performance: Math.round(report.categories.performance.score * 100),
                accessibility: Math.round(report.categories.accessibility.score * 100),
                bestPractices: Math.round(report.categories['best-practices'].score * 100),
                seo: Math.round(report.categories.seo.score * 100),
              };

              // Append scores to the CSV file
              writer.write([url, preset, scores.performance, scores.accessibility, scores.bestPractices, scores.seo]);
              resolve();
            }
          });
        } catch (error) {
          console.error(`└ Failed to find JSON report file for ${url}: ${error.message}`);
          reject(error);
        }
      } else {
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
      if (auditPreset === 'both') {
        // Run for both desktop and mobile
        await runLighthouse(urls[i], 'desktop');
        await runLighthouse(urls[i], 'mobile');
      } else {
        // Run for the specified preset
        await runLighthouse(urls[i], auditPreset);
      }
    } catch (error) {
      console.error(`└ Failed to complete Lighthouse audit for ${urls[i]}: ${error.message}`);
    }
  }

  // End CSV writing
  writer.end();

  // After all audits, output the path of the CSV file
  setTimeout(() => {
    console.log(`\n✔ Consolidated report saved to: ${csvFilePath}`);
  }, 2000);  // Wait for a bit to ensure the CSV file is fully written before printing the path
}

runAuditsConsecutively();