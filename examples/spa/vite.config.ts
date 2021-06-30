import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Store from 'vite-plugin-store'
import Markdown from 'vite-plugin-md'
import Restart from 'vite-plugin-restart'
const { resolve } = require('path')
const config = defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['virtual:generated-store'],
  },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Store({
      storeDir: 'src/store',
      extensions: ['ts', 'js'],
    }),
    Markdown(),
    Restart({
      restart: ['../../dist/*.js'],
    }),
  ],
})

export default config
