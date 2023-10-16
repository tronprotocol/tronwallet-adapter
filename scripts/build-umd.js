/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { rollup } = require('rollup');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const terser = require('@rollup/plugin-terser');
const json = require('@rollup/plugin-json');
const { cwd } = require('process');
const { resolve } = require('path');

const inputOptions = {
    input: './lib/cjs/index.js',
    plugins: [commonjs(), nodeResolve(), json()],
    external: [
        'eventemitter3',
        'buffer',
        'events',
        'react',
        'react-dom',
        '@tronweb3/tronwallet-abstract-adapter',
        '@tronweb3/tronwallet-adapter-tronlink',
    ],
};
const commonOptions = {
    format: 'umd',
    name: getOutputName(),
    globals: {
        buffer: 'buffer.Buffer',
        events: 'EventEmitter',
        eventemitter3: 'EventEmitter3',
        react: 'React',
        'react-dom': 'ReactDOM',
        '@tronweb3/tronwallet-abstract-adapter': 'TronwalletAbstractAdapter',
        '@tronweb3/tronwallet-adapter-tronlink': 'TronwalletAdapterTronlink',
    },
};
const outputOptionsList = [
    {
        ...commonOptions,
        file: './lib/umd/index.js',
    },
    {
        ...commonOptions,
        file: './lib/umd/index.min.js',
        plugins: [terser()],
    },
];
build();

async function build() {
    let bundle;
    let bundleFailed = false;
    try {
        bundle = await rollup(inputOptions);
        await generateOutputs(bundle);
    } catch (e) {
        bundleFailed = true;
        console.error(e);
    }
    if (bundle) {
        bundle.close();
    }
    process.exit(bundleFailed ? 1 : 0);
}

async function generateOutputs(bundle) {
    for (const outputOptions of outputOptionsList) {
        await bundle.write(outputOptions);
    }
}

function getOutputName() {
    const packageJson = require(resolve(cwd(), 'package.json'));
    const name = packageJson.name.split('/')[1].replaceAll(/(?:^|-)([a-z])/g, ($0, $1) => $1.toUpperCase());
    console.log('[build:umd] current name: ' + name);
    return name;
}
