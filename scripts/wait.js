const args = process.argv.slice(2);

console.log('Waiting ' + args[0] + 'ms...');

setTimeout(function () {}, args[0]);
