/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIRS = [path.resolve(__dirname, '../packages/adapters'), path.resolve(__dirname, '../packages/react')];
const pkgVersions = [];
DIRS.forEach((dir) => {
    const subDirs = fs.readdirSync(dir);
    subDirs.forEach((pkg) => {
        try {
            const { name, version } = JSON.parse(fs.readFileSync(path.resolve(dir, pkg, 'package.json')));
            pkgVersions.push({
                name,
                version,
            });
        } catch (e) {
            console.error(e);
        }
    });
});

pkgVersions.forEach(({ name, version }) => {
    try {
        const oldVersion = execSync(`npm view ${name} version`);
        console.log(`${name}: ${oldVersion.toString().trim()} -> ${version}`);
    } catch (e) {
        // ignore
    }
});

console.log('Tag Content: ');
pkgVersions.forEach(({ name, version }) => {
    console.log(`- [${name}@${version}](https://www.npmjs.com/package/${name})`);
});
