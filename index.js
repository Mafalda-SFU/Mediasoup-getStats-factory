import { cpus, freemem, loadavg, totalmem, uptime } from 'os'

import pidusage from 'pidusage'


function _stats()
{
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

  return new Proxy(worker, {get: getterFactory({getResourceUsage})});
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

    ({[prop]: property} = properties)
    if(property) return property;

    ({[prop]: property} = target)
    if(property instanceof Function)
      return property.bind(target)  // TODO: memoize

    return property
  }
}


export default function(mediasoup)
{
  return new Proxy(mediasoup, {get: getterFactory({_stats, createWorker})})
}
