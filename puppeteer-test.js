/***
 *** (C)opyright 2024 Tom Freudenberg
 *** Eleventy puppeteer page hook plugin -> node/script
 ***/

const args = process.argv;
const path = require('path');
const fs = require('fs');

function argParse(argValue, defaultValue) {
  return (typeof argValue !== 'undefined' && argValue) ? argValue : defaultValue
}

const inputFile = argParse(args[2], '');
const outputType = argParse(args[3], '');
const outputFile = argParse(args[4], '');

const Puppeteer = require('puppeteer');
const elevResult = fs.readFileSync(inputFile, 'utf8');

// wrap this script in async
(async () => {

// define the options per output
let pdf_publish_options = {}
// for pdf
pdf_publish_options = {
  path: outputFile,
  format: 'A4',
  landscape: false,
  preferCSSPageSize: true,
  ignoreInvalidPageRanges: true,
  printBackground: true,
  displayHeaderFooter: false
}

// standard log info: script.js:path/input.html|path.output.ext|a4|landscape
console.log(path.basename(args[1]) + ' (' + outputType + '):' + inputFile + '|' + outputFile);

// prepare launch args
puppeteer_args = ['--disable-web-security']
// check special config when running as root
if (process.getuid() == 0) {
  puppeteer_args.push('--no-sandbox')
}
// convert html into pdf
const browser = await Puppeteer.launch({ headless: 'new', args: puppeteer_args }).catch(e => console.error(e));
const page = await browser.newPage().catch(e => console.error(e));

page.on('console', msg => {
  for (let i = 0; i < msg.args().length; ++i)
    console.error(`${i}: ${msg.args()[i]}`);
});

// use the content received by eleventy
await page.setContent(elevResult, { waitUntil: 'networkidle2' });
// save as pdf
await page.pdf(pdf_publish_options).catch(e => console.error(e));

// stop the headless session
await browser.close().catch(e => console.error(e));

})(); // directly call the async block
