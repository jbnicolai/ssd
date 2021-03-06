[![Build Status](https://travis-ci.org/daiweilu/ssd.svg?branch=master)](https://travis-ci.org/daiweilu/ssd)

# SSD (Single Server of Dockers)

**SSD** wants to automate the process of deploying simple hobby and test web apps, make it easier so you can focus on the fun part.

## Heads Up

SSD uses [Docker](https://www.docker.com/) to build isolated environment and deploy your project. Thus, **some Docker knowledge is expected.**

SSD requires to setup Docker with HTTPS connections, it may sound hassle at the beginning. But I got a bash script to set it up for you. Though you do have to copy files from your remote machine to you computer. However, I only have scripts for Ubuntu 14.04 for AWS. You are welcome to contribute more setup scripts here.

### Prepare Remote Server

First, install Docker on your server and make Docker accept HTTPS connection. Copy `setup-docker.sh` in this repo to your remote machine. And run:

```bash
bash setup-docker.sh <you.host.name> <passphrase>
```

- `you.host.name` is a public domain that associated with your server's IP. Unfortunately, generating certificate for HTTPS requires a domain name to do so (EC2 instance always come with a domain name).
- `passphrase` is a password you choose for your keys.

This script will:

1. Install Docker.
1. Generate ca certificate and keys in `$HOME/.docker` directory.
1. Change the docker config to enable HTTPS connection.
1. Restart Docker daemon.

You need to copy `ca.pem`, `cert.pem` and `key.pem` from `$HOME/.docker` to your local machine for SSD to connect. You can test connections on your local machine (assuming you have docker installed on your local, OSX users refer to [boot2docker]( https://docs.docker.com/installation/mac/)) with:

```bash
docker --tlsverify --tlscacert=<path/to/ca.pem> --tlscert=<path/to/cert.pem> --tlskey=<path/to/key.pem> -H=<your.host.name>:2376 version
```

## Usage

### Install

```bash
npm install -g ssd
```

### Command Line Interface

```txt
ssd [-s stage-name] <action> [action options]

    -s testing

    actions:
        init                Scaffold current project
        status              Checkout the information of image and container
        up  [-c false]      Build the image and start container
                                with `-c` flag, we will build using cache
        start               Start container
        stop                Stop container
        restart             Stop then start container
        exec [commands...]  Execute a command inside the container
```

### API

You can also require `ssd` in your own build script.

```javascript
var Server = require('ssd');

var s = new Server('<stage name>');

s.status().then(function () {
  console.log(s.images);
  console.log(s.containers);
});

// `s` is a event emitter instance
s.on('info', function (msg) {

});

s.on('error', function (err) {

});

// `end` is emitted when `up` finish or on error
s.on('end', function () {

});

// status messages will be emitted on `s` instance
s.up({cache: false});
```

### Local Project Structure Config

Local projects should follow a specific directory structure:

```txt
source/
    meta.json
    Dockerfile
    <...other app files...>
stage/
    production/
        ssd.json
    <...more stages.../>
```

- `source` contains source code and the information to build and run the app.
- `stage` contains stages. You can consider each stage as a remote machine.
- `meta.json` contains information to build and run Docker container.
- `Dockerfile` used to build Docker image.
- `ssd.json` used to define connection information for a remote machine belongs to current stage.

## TODO

- Support multiple images and containers
- Support dependencies among containers
- Support logging progress information in CLI when pulling baseimages while building image
