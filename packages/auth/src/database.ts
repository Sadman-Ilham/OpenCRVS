import * as redis from 'redis'
import { REDIS_HOST } from './constants'
import { promisify } from 'util'

let redisClient: redis.RedisClient

export interface IDatabaseConnector {
  stop: () => void
  start: () => void
  set: (key: string, value: string) => Promise<void>
  get: (key: string) => Promise<string | null>
  del: (key: string) => Promise<number>
}

export async function stop() {
  redisClient.quit()
}

export async function start() {
  redisClient = redis.createClient({
    host: REDIS_HOST,
    retry_strategy: options => {
      return 1000
    }
  })
}

export const get = (key: string) =>
  promisify(redisClient.get).bind(redisClient)(key)

export const set = (key: string, value: string) =>
  promisify(redisClient.set).bind(redisClient)(key, value)

export const del = (key: string) =>
  promisify(redisClient.del).bind(redisClient)(key)

export const connector: IDatabaseConnector = { set, get, del, stop, start }

export default connector
