const {cpus, freemem, loadavg, totalmem, uptime} = require('os')

const pidusage = require('pidusage')


async function _stats()
{
  // TODO: provide stats of real Mediasoup Workers, not only the Mafalda ones
  return {
    os: {
      // availableParallelism: availableParallelism(),
      cpus: cpus(),
      freemem: freemem(),
      loadavg: loadavg(),
      totalmem: totalmem(),
      uptime: uptime()
    },
    process: {
      // constrainedMemory: process.constrainedMemory,  // Node.js 19.6.0
      cpuUsage: process.cpuUsage(),
      // hrtime: process.hrtime.bigint(),
      memoryUsage: process.memoryUsage(),
      resourceUsage: process.resourceUsage(),
      uptime: process.uptime()
    }
  }
}

async function createWorker(settings)
{
  const worker = await this.createWorker(settings)

  return new Proxy(worker, handlerWorker);
}

async function getResourceUsage()
{
  const [
    resourceUsage,
    {
      cpu: _cpu, ctime: _ctime, elapsed: _elapsed, memory: _memory,
      pid: _pid, ppid: _ppid, timestamp: _timestamp
    }
  ] = await Promise.all([this.getResourceUsage(), pidusage(this.pid)])

  return {
    ...resourceUsage,
    _cpu, _ctime, _elapsed, _memory, _pid, _ppid, _timestamp
  }
}

// TODO: unify with Mediasoup-horizontal
function getterFactory(properties)
{
  return function get(target, prop)
  {
    let property

    // TODO: memoize binded methods
    ({[prop]: property} = properties)
    if(property) return property.bind(target);

    ({[prop]: property} = target)
    if(property instanceof Function) return property.bind(target)

    return property
  }
}


const handlerMediasoup = {get: getterFactory({_stats, createWorker})}
const handlerWorker = {get: getterFactory({getResourceUsage})}


module.exports = function(mediasoup)
{
  return new Proxy(mediasoup, handlerMediasoup)
}
