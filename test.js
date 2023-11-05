const {deepStrictEqual} = require('node:assert/strict')
const EventEmitter = require('node:events')
const test = require('node:test')

const getStatsFactory = require('./index.js')


test('lifecycle', async function()
{
  const mediasoup = {
    async createWorker()
    {
      const worker = {
        close()
        {
          this.observer.emit('close')
        },
        async getResourceUsage()
        {
          return {}
        },
        observer: new EventEmitter,
        pid: process.pid
      }

      this.observer.emit('newworker', worker)

      return worker
    },
    observer: new EventEmitter
  }

  const {close, getStats} = await getStatsFactory(mediasoup)

  deepStrictEqual(typeof close, 'function')
  deepStrictEqual(typeof getStats, 'function')

  const stats1 = await getStats()

  deepStrictEqual(typeof stats1, 'object')
  deepStrictEqual(typeof stats1.os, 'object')
  deepStrictEqual(typeof stats1.pidusages, 'undefined')
  deepStrictEqual(typeof stats1.process, 'object')

  const worker = await mediasoup.createWorker()

  deepStrictEqual(typeof worker, 'object')
  deepStrictEqual(typeof worker.getResourceUsage, 'function')

  const resourceUsage = await worker.getResourceUsage()

  deepStrictEqual(typeof resourceUsage, 'object')

  const stats2 = await getStats()

  deepStrictEqual(typeof stats2, 'object')
  deepStrictEqual(typeof stats2.os, 'object')
  deepStrictEqual(typeof stats2.pidusages, 'object')
  deepStrictEqual(typeof stats2.process, 'object')

  worker.close()
  close()
})
