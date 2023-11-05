const {
  availableParallelism, cpus, freemem, loadavg, totalmem, uptime
} = require('os')

const pidusage = require('pidusage')


module.exports = function({observer})
{
  async function getStats()
  {
    // TODO: provide stats of real Mediasoup Workers, not only for the Mafalda
    // ones

    const pidusages = workersPids?.length
      ? await pidusage(workersPids)
      : undefined

    return {
      os: {
        availableParallelism: availableParallelism(),
        cpus: cpus(),
        freemem: freemem(),
        loadavg: loadavg(),
        totalmem: totalmem(),
        uptime: uptime()
      },
      pidusages,
      process: {
        constrainedMemory: process.constrainedMemory(),
        cpuUsage: process.cpuUsage(),
        hrtime: process.hrtime.bigint(),
        memoryUsage: process.memoryUsage(),
        resourceUsage: process.resourceUsage(),
        uptime: process.uptime()
      }
    }
  }

  function onNewWorker({observer, pid})
  {
    if(workersPids.includes(pid)) return

    workersPids.push(pid)

    observer.once('close', function()
    {
      const index = workersPids.indexOf(pid)

      if(index !== -1) workersPids.splice(index, 1)
    })
  }


  const close = observer
    .on('newworker', onNewWorker)
    .off.bind(observer, 'newworker', onNewWorker)

  const workersPids = []

  return {close, getStats}
}
