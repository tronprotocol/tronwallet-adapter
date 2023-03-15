/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');

const pkgDepMap = new Map();
function scanDir(dir) {
    try {
        const content = fs.readFileSync(path.resolve(dir, 'package.json'), { encoding: 'utf-8' });
        const json = JSON.parse(content);
        const depVersionMap = new Map();
        const deps = {
            ...(json.dependencies || {}),
            ...(json.devDependencies || {}),
            ...(json.peerDependencies || {}),
        };
        Object.entries(deps).forEach(([pkgName, version]) => {
            const numVersion = getNumberVersion(version);
            if (numVersion) {
                depVersionMap.set(pkgName, numVersion);
            }
        });
        pkgDepMap.set(json.name, {
            version: json.version,
            depVersionMap,
        });
    } catch (e) {
        //
    }
    fs.readdirSync(dir).forEach((subDir) => {
        const newPath = path.resolve(dir, subDir);
        if (!['node_modules', 'lib'].includes(subDir) && fs.statSync(newPath).isDirectory()) {
            scanDir(newPath);
        }
    });
}
function getDepTree() {
    // eslint-disable-next-line no-undef
    scanDir(path.resolve(process.cwd(), 'packages'));
}

function findMismatchPackage() {
    const resultMap = {};

    for (const [pkgName, pkgDepInfo] of pkgDepMap.entries()) {
        const misMatchDeps = [];
        const { depVersionMap } = pkgDepInfo;
        for (const [depName, version] of depVersionMap.entries()) {
            if (pkgDepMap.has(depName) && version !== pkgDepMap.get(depName).version) {
                misMatchDeps.push(depName);
            }
        }
        resultMap[pkgName] = misMatchDeps;
    }
    return resultMap;
}

function getNumberVersion(versionString) {
    return versionString.replace(/^[^\d]*/, '');
}

function run() {
    getDepTree();
    const resultMap = findMismatchPackage();
    for (const [pkgName, misMatchDeps] of Object.entries(resultMap)) {
        if (misMatchDeps.length === 0) {
            continue;
        }
        console.log(`The dependencies in ${pkgName} is mismatched:`);
        misMatchDeps.forEach((dep) => {
            console.log(`\t${dep} should have version ${pkgDepMap.get(dep).version}`);
        });
    }
    if (Object.values(resultMap).some((v) => v.length > 0)) {
        process.exit(1);
    }
}
run();
