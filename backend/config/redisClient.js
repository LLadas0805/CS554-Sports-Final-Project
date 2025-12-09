import redis from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379' || 'redis://redis:6379';
const client = redis.createClient({ url: REDIS_URL });

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

(async () => {
  try {
    await client.connect();
    console.log('Connected to Redis at', REDIS_URL);
  } catch (e) {
    console.error('Failed to connect to Redis at', REDIS_URL, e);
  }
})();

export default client;
