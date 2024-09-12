import { Elysia } from 'elysia'
import { defaultOptions } from '../constants.js'
import type { Options } from '../types.js'
import { debug } from './debug.js'
import { getIP } from './getip.js'

export const plugin = (userOptions?: Partial<Options>) => (app: Elysia) => {
  const options: Options = {
    ...defaultOptions,
    ...userOptions,
  }

  return app.use(
    new Elysia({
      name: 'elysia-ip',
    }).derive({ as: 'global' }, ({ request }): { ip: string } => {
      serverIP: {
        if (!options.headersOnly && globalThis.Bun) {
          const server = options.injectServer(app)
          if (!server) {
            debug(
              'plugin: Elysia server is not initialized. Make sure to call Elyisa.listen()',
            )
            debug('plugin: use injectServer to inject Server instance')
            break serverIP
          }

          if (!server.requestIP) {
            debug('plugin: server.requestIP is null')
            debug('plugin: Please check server instace')
            break serverIP
          }

          const socketAddress = server.requestIP(request)
          debug(`plugin: socketAddress ${JSON.stringify(socketAddress)}`)
          if (!socketAddress) {
            debug('plugin: ip from server.requestIP return `null`')
            break serverIP
          }
          return { ip: socketAddress.address }
        }
      }
      return {
        ip: getIP(request.headers, options.checkHeaders) || '',
      }
    }),
  )
}
