# Next.js Application - Local Deployment and Single-Click Startup

This guide explains how to deploy this Next.js application on your own computer and set up a single-click startup method without using the terminal.

## Local Deployment

1.  **Install Node.js:**
    -   If you don't have Node.js installed, download it from [https://nodejs.org/](https://nodejs.org/) and follow the installation instructions. Node.js usually comes with npm (Node Package Manager).

2.  **Navigate to the Project:**
    -   Open your terminal or command prompt and navigate to the root directory of this Next.js project using the `cd` command.

3. **Install dependencies:**
    -   Run `npm install` to download all project dependencies.

4. **Start the Development Server:**
    - Run `npm run dev` to start the application.
    - The app will be running on a local address, usually http://localhost:3000.

## Single-Click Startup

1.  **Create `run_app.sh`:**
    -   A `run_app.sh` file has been created in the root directory. This file contains the command `npm run dev`.

2. **Make Shortcut:**
    - Navigate to the `run_app.sh` file.
    - Create a shortcut on your desktop to this file.
    - Double clicking this shortcut should now run the Next.js app.
