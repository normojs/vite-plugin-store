
import { ViteDevServer } from 'vite'
import { debug, normalizePath, slash, getPathName } from './utils'
import { ResolvedOptions } from './types'
import { HMR_MODULE_NAMES } from './constants'
export function handleHMR(
  server: ViteDevServer,
  options: ResolvedOptions,
  storeFilePaths?: string[],
) {
  const { ws, watcher } = server

  function fullReload() {
    ws.send({
      type: 'full-reload',
    })
  }

  watcher.on('add', (file) => {
    const path = slash(file)
    debug.hmr('add', path)
    fullReload()
  })
  watcher.on('unlink', (file) => {
    const path = slash(file)
    debug.hmr('remove', path)
    fullReload()
  })

  // TODO: 删除、添加
  watcher.on('change', (file) => {
    const path = slash(file)

    const isStoreDir = path.startsWith(`${options.storeDir}/`)

    /* const hotEvent: any = {
      // type: state、full-reload、hot-update
      type: 'hot-update',
    } */

    if (isStoreDir) {
      const fileName = getPathName(path)
      // 如果修改的文件名: mutations、actions、getters
      if (HMR_MODULE_NAMES.includes(fileName)) {
        // TODO: 防抖
        server.ws.send({
          type: 'custom',
          event: 'vite-plugin-store-update',
          data: { // hotEvent
            type: 'hot-update',
          },
        })
      }
      else {
        fullReload()
      }
    }// end if(isStoreDir)
  })
}
