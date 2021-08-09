
import { ViteDevServer } from 'vite'
import { debug, normalizePath, slash, getPathName } from './utils'
import { ResolvedOptions } from './types'
import { HMR_MODULE_NAMES } from './constants'
export function handleHMR(
  server: ViteDevServer,
  generateRoot: any,
  options: ResolvedOptions,
  storeFilePaths: string[],
) {
  const { ws, watcher } = server

  function fullReload() {
    // invalidate module
    // getPagesVirtualModule(server)
    // clearRoutes()
    ws.send({
      type: 'full-reload',
    })
  }

  watcher.on('add', (file) => {
    const path = slash(file)
    // if (isTarget(path, options)) {
    // addPage(pages, path, options)
    debug.hmr('add', path, storeFilePaths)
    fullReload()
    // }
  })
  watcher.on('unlink', (file) => {
    const path = slash(file)
    // if (isTarget(path, options)) {
    // removePage(pages, path)
    debug.hmr('remove', path)
    fullReload()
    // }
  })

  // TODO: 删除、添加
  watcher.on('change', (file) => {
    const path = slash(file)

    const isStoreDir = path.startsWith(`${options.storeDir}/`)

    /* const hotEvent: any = {
      // type: state、full-reload、hot-update
      // type: 'hot-update',
    } */

    if (isStoreDir) {
      const fileName = getPathName(path)
      // 如果修改的文件名: mutations、actions、getters
      if (HMR_MODULE_NAMES.includes(fileName)) {
        //
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
      /* for (const index in generateRoot.moduleOptions) {
        const moduleOption = generateRoot.moduleOptions[index]
        if (path === moduleOption.fullPath) {
          hotEvent = moduleOption
          break
        }
      } // end for
      // TODO: 防抖动
      if (['index', 'module'].includes(hotEvent.moduleInType)) {
        // 设置 type
        hotEvent.type = 'state'
      }
      else {
        hotEvent.type = 'hot-update'
      }
      server.ws.send({
        type: 'custom',
        event: 'vite-plugin-store-update',
        data: hotEvent,
      }) */
    }// end if(isStoreDir)
  })
}
