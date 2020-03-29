const { Pool } = require('pg')
const { createPostGraphileSchema } = require('postgraphile')

// This script is called from scripts/generate-cache
const { getConnectionString, getSchemas } = require('./config')
const { options } = require('./postgraphileOptions')

async function main() {
  const pgPool = new Pool({
    connectionString: getConnectionString(),
  })
  await createPostGraphileSchema(pgPool, getSchemas(), {
    ...options,
    writeCache: `${__dirname}/api/_shared/postgraphile.cache`,
  })
  await pgPool.end()
}

main().then(null, (e) => {
  // eslint-disable-next-line no-console
  console.error(e)
  process.exit(1)
})
