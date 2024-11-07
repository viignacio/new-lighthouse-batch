# Lighthouse CLI Automation Script

This script automates running Lighthouse audits on a list of URLs, generating individual reports for each URL in HTML format. The URLs are read from a `.txt` file, and the reports are saved to a specified output folder.

## Prerequisites

- **Node.js**: This script requires Node.js to be installed on your machine. You can download it from [Node.js official website](https://nodejs.org/).
- **Lighthouse CLI**: The Lighthouse CLI is needed to run the audits. You can install it globally via npm:

  ```bash
  npm install -g lighthouse
  ```

## Setup
1. Clone or Download the Repository
Clone or download this repository to your local machine.

2. Set Up the urls.txt File
  ```
  https://example.com
  https://anotherexample.com
  https://yetanotherexample.com
  ```

3. Customize the Script Settings
•	Output Folder: You can specify the output folder where the Lighthouse reports will be saved by modifying the outputFolder variable in the lighthouse-audit.js script. By default, it is set to lighthouse-reports.
•	Report Format: The script is currently configured to generate reports in HTML format. You can change this format to json or csv by modifying the reportFormat variable in the script, but HTML is recommended for a more readable report.

4. Folder Structure
Your folder structure should look like this:
  ```
  project-folder/
  ├── urls.txt               # List of URLs to audit
  ├── lighthouse-audit.js    # The script file
  ├── README.md              # This README file
  └── lighthouse-reports/    # Output folder for reports (will be created automatically)
  ```

## Running the Script
Once you have completed the setup, you can run the script as follows: node lighthouse-audit.js

The script will:
1.	Read each URL from urls.txt.
2.	Run Lighthouse against each URL.
3.	Save each report in HTML format in the specified output folder (default: lighthouse-reports).

Example Output
After running the script, the lighthouse-reports folder will contain reports like:
  ```
  lighthouse-reports/
  ├── report-1.html
  ├── report-2.html
  └── report-3.html
  ```

Each report corresponds to a URL from urls.txt, in the order they are listed.

## Troubleshooting
•	Ensure Node.js and Lighthouse CLI are installed correctly.
•	Make sure urls.txt is in the correct format, with one URL per line and no empty lines in between.
•	If you encounter permission issues, try running the command with elevated privileges (e.g., sudo on macOS/Linux).

## License
This project is licensed under the MIT License.