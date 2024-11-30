# Çak Bilet Web App

## Introduction

This is a "web app" project that offers an event management and ticket sales system. You can create and edit events in the project, open an account, log in to your existing account, and simulate a purchase by viewing the event details. It is a multi-page web application and uses a local server.

## Installation

Firstly, you need to install [node](https://nodejs.org/en) javascript runtime enviroment for run the project.
After installing the project to your computer, you need to install the dependencies in the "package.json" file. For example;

Use the node package manager to install [express](https://www.npmjs.com/package/express).

```bash
npm install express
```
If you want to install all dependicies at once, you can use the command below.

```bash
npm install
```

## Usage

You can use the command below for run the project. If you install [nodemon](https://www.npmjs.com/package/nodemon) before, you can use other command below.

```bash
node app.js
```
If you have nodemon use this;

```bash
nodemon app.js
```
After that, you can go to "localhost:3000" address. (This project uses 3000 port number. If 3000 port is full, please change port number on project or release this port.)

You can use "ctrl+c" on the command line panel for stop the server.


## License

[MIT](https://choosealicense.com/licenses/mit/)