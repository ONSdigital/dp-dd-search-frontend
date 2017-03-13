import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/index.js',
    plugins: [ babel() ],
    format: 'cjs',
    dest: 'assets/main.js',
    sourceMap: true
};