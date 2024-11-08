# Lighthouse CLI Automation Script

This script automates running Lighthouse audits on a list of URLs, generating individual reports for each URL in HTML format. The URLs are read from a `.txt` file, and the reports are saved to a specified output folder.

## Prerequisites

- **Node.js**: This script requires Node.js to be installed on your machine. You can download it from [Node.js official website](https://nodejs.org/).

## Setup
1. Clone or Download the Repository
Clone or download this repository to your local machine.

2. Install Dependencies
Run the following command to install the required dependencies:
  ```bash
  npm install
  ```

3. Set Up the urls.txt File
  ```
  https://example.com
  https://anotherexample.com
  https://yetanotherexample.com
  ```

4. Customize the Script Settings
- Text file: You can specify the name of the text file containing the URLs to audit by modifying the urlsFile variable in the lighthouse-audit.js script. By default, it is set to urls.txt.
- Output Folder: You can specify the output folder where the Lighthouse reports will be saved by modifying the outputFolder variable in the lighthouse-audit.js script. By default, it is set to lighthouse-reports.
- Report Format: The script is currently configured to generate reports in HTML format. You can change this format to json or csv by modifying the reportFormat variable in the script, but HTML is recommended for a more readable report.
- Audit Preset: You can specify the Lighthouse audit preset to use by modifying the auditPreset variable in the script. By default, it is set to mobile.

5. Folder Structure
Your folder structure should look like this:
  ```
  project-folder/
  ├── urls.txt               # List of URLs to audit
  ├── lighthouse-audit.js    # The script file
  ├── README.md              # This README file
  └── lighthouse-reports/    # Output folder for reports (will be created automatically)
  ```

## Running the Script
Once you have completed the setup, you can run the script as follows: 
  ```bash
  npm start
  ```

The script will:
1.	Read each URL from urls.txt.
2.	Run Lighthouse against each URL.
3.	Save each report in HTML format in the specified output folder (default: lighthouse-reports).

Example Output
After running the script, the lighthouse-reports folder will contain reports like:
  ```
  lighthouse-reports/
  └── MM-DD-YYYY
      ├── report-{url1}-{date}.html
      ├── report-{url2}-{date}.html
      └── report-{url3}-{date}.html
  ```

Each report corresponds to a URL from urls.txt, in the order they are listed.

## Troubleshooting
- Ensure Node.js and Lighthouse CLI are installed correctly.
- Make sure urls.txt is in the correct format, with one URL per line and no empty lines in between.
- If you encounter permission issues, try running the command with elevated privileges (e.g., sudo on macOS/Linux).

## License
This project is licensed under the MIT License.