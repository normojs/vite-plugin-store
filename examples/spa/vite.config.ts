import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Store from 'vite-plugin-store'
import Markdown from 'vite-plugin-md'
import Restart from 'vite-plugin-restart'

const config = defineConfig({
  // resolve:{
  //   alias:
  // },
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Store({
      storeDir: 'src/store',
      pagesDir: [
        { dir: 'src/pages', baseRoute: '' },
        { dir: 'src/features/admin/pages', baseRoute: 'admin' },
      ],
      extensions: ['ts', 'js'],
      syncIndex: false,
      replaceSquareBrackets: true,
    }),
    Markdown(),
    Restart({
      restart: ['../../dist/*.js'],
    }),
  ],
})

export default config
