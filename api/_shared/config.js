// const path = require('path')
// const fs = require('fs')
// // look for a .env file that is named after the NODE_ENV, if it doesn't exist just use the default ".env" file
// const nodeEnv = process.env.NODE_ENV || 'development'
// const potentialEnvFile = path.resolve(process.cwd(), `.env.${nodeEnv}`)
// const envFile = fs.existsSync(potentialEnvFile) ? potentialEnvFile : path.resolve(process.cwd(), '.env')
// require('dotenv').config({ path: envFile })

exports.getSchemas = () => {
  return process.env.DATABASE_SCHEMAS ? process.env.DATABASE_SCHEMAS.split(',') : ['public']
}

exports.getConnectionString = () => {
  const {
    DATABASE_HOST: host,
    DATABASE_NAME: database,
    DATABASE_USER: username,
    DATABASE_PASSWORD: password = '',
    DATABASE_PORT: port,
    DATABASE_SSL: ssl = false,
  } = process.env

  return `postgres://${username}:${password}@${host}:${port}/${database}${ssl ? '?sqlmode=require&ssl=1' : ''}`
}
