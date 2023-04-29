import resolvePlugin from '@rollup/plugin-node-resolve';
import babelPlugin from 'rollup-plugin-babel';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
// import { uglify } from 'rollup-plugin-uglify';

export default [
  {
    input: './src/index.ts',
    output: {
      file: './umd/kune.umd.js', // 导出文件
      format: 'umd', // 打包文件支持的形式
      name: 'Kune',
    },
    plugins: [
      resolvePlugin(),
      typescript(),
      commonjs(),
      babelPlugin({
        exclude: 'node_modules/**',
        runtimeHelpers: true,
      }),
      // uglify(),
    ],
  },
];
