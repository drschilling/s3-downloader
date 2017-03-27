const fs = require('fs')
const opts = require('commander')
const pkg = require('./package')

opts
  .version(pkg.version)
  .option('-c, --credentials <file>', 'Credentials file with Access Id and Secret Key')
  .option('-a, --access-key-id <access-id>', 'AWS Access Id')
  .option('-s, --secret-access-key <secret-key>', 'AWS Secret Key')
  .option('-b, --bucket <bucket>', 'Bucket to download')
  .option('-k, --key <key>', 'Bucket key to download')
  .option('-o, --output <output>', 'Output path')
  .parse(process.argv)

  const ACCESS_KEY_ID_IDX = 2
  const SECRET_ACCESS_KEY_IDX = 3

if (opts.credentials) {
  try {
    let file = fs.readFileSync(opts.credentials, {encoding:'utf-8'})
    let credentials = file.split('\n')[1].split(',')
    console.log(credentials)

    opts.accessKeyId = credentials[ACCESS_KEY_ID_IDX]
    opts.secretAccessKey = credentials[SECRET_ACCESS_KEY_IDX]
  } catch(ex) {
    console.error('Problem reading credential file', ex)
    process.exit(1)
  }
}

if (!opts.accessKeyId || !opts.secretAccessKey) {
  console.error('No credentials, id or secret key provided')
  process.exit(1)
}

if (!opts.bucket) {
  console.error('No bucket provided')
  process.exit(1)
}

if (!opts.key) {
  console.error('No bucket key provided')
  process.exit(1)
}

if (!opts.output) {
  console.error('No output path provided')
  process.exit(1)
}

module.exports = opts