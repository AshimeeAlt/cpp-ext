const { stdout, stdin, stderr, platform } = require('process');
const nah = ['win32','android','aix','freebsd','openbsd','sunos'];
const maybe = ['darwin'];
const yeah = ['linux'];

if (nah.includes(platform)) {
  console.error('You are on an unsupported platform!');
} else if (maybe.includes(platform)) {
  console.warn('You are on a untested platform.');
} else if (yeah.includes(platform)) {
  console.log('You are on a supported OS but unknown platform, this may fail.');
}

const fs = require('fs');

function built() {
  console.log('Built `library.cpp` outputted into `library.wasm`');
  console.log('Making wrapper');
  const extWasmBuff = fs.readFileSync('./library.wasm');
  const extWasmJSON = JSON.stringify(extWasmBuff.toJSON().data);
  const ext = fs.readFileSync('./subextension.js', { encoding: 'utf-8' }).replace('/*__wasmOverride*/', extWasmJSON);
  fs.writeFileSync('./extension.js', ext);
  console.log('Extension built!');
}

const child = require('child_process').exec('make');
child.stderr.pipe(stderr);
child.stdout.pipe(stdout);
child.on('exit', function() {
  if (child.exitCode == 0) {
    built();
  } else {
    console.error('Failed to build.');
  }
})