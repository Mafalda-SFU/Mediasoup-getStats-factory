const assert = require('node:assert')
const test = require('node:test')

const mediasoupWrapper = require('./index.js')


test('mediasoup-wrapper', async function(t)
{
  const mediasoup = {
    async createWorker()
    {
      return {
        async getResourceUsage()
        {
          return {}
        },
        pid: process.pid
      }
    }
  }

  const mw = await mediasoupWrapper(mediasoup)

  assert(typeof mw, 'object')
  assert(typeof mw._stats, 'function')
  assert(typeof mw.createWorker, 'function')

  const stats = await mw._stats()

  assert(typeof stats, 'object')
  assert(typeof stats.os, 'object')
  assert(typeof stats.process, 'object')

  const worker = await mw.createWorker()

  assert(typeof worker, 'object')
  assert(typeof worker.getResourceUsage, 'function')

  const resourceUsage = await worker.getResourceUsage()

  assert(typeof resourceUsage, 'object')
  assert(typeof resourceUsage._cpu, 'number')
  assert(typeof resourceUsage._ctime, 'number')
  assert(typeof resourceUsage._elapsed, 'number')
  assert(typeof resourceUsage._memory, 'number')
  assert(typeof resourceUsage._pid, 'number')
  assert(typeof resourceUsage._ppid, 'number')
  assert(typeof resourceUsage._timestamp, 'number')
})
