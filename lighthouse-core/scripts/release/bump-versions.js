/**
 * @license Copyright 2019 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

import fs from 'fs';

import glob from 'glob';

import {readJson} from '../../../root.js';

const NEW_VERSION = process.argv[2];
if (!/^\d+\.\d+\.\d+(-dev\.\d{8})?$/.test(NEW_VERSION)) {
  throw new Error('Usage: node bump-versions.json x.x.x');
}

const OLD_VERSION = readJson('package.json').version;

const ignore = [
  '**/node_modules/**',
  'changelog.md',
  'docs/recipes/auth/package.json',
  'docs/recipes/custom-gatherer-puppeteer/package.json',
  'docs/recipes/integration-test/package.json',
];

for (const file of glob.sync('**/{package.json,*.md,*-expected.txt}', {ignore})) {
  let text;
  if (file === 'package.json') {
    const pkg = readJson(file);
    if (pkg.version.startsWith('file')) continue;
    pkg.version = NEW_VERSION;
    text = JSON.stringify(pkg, null, 2) + '\n';
  } else if (file.endsWith('.md')) {
    // Replace `package.json`-like examples in markdown files.
    text = fs.readFileSync(file, 'utf-8');
    text = text.replace(/"lighthouse": ".*?"/g, `"lighthouse": "^${NEW_VERSION}"`);
  } else {
    text = fs.readFileSync(file, 'utf-8');
    text = text.replace(OLD_VERSION, NEW_VERSION);
  }

  fs.writeFileSync(file, text);
}
