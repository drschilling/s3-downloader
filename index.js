const s3 = require('s3')
const Rx = require('rx')

let opts = require('./opts')

let s3opts = {
  accessKeyId: opts.accessKeyId,
  secretAccessKey: opts.secretAccessKey
}

let client = s3.createClient({s3Options: s3opts})

let listParams = {
  'Bucket': opts.bucket,
  'Prefix': opts.key,
  'Delimiter': '/'
}
let lister = client.listObjects({s3Params: listParams})

Rx.Observable.fromEventPattern((handler) => {
  lister.addListener('data', handler)
}, (handler) => {
  lister.removeListener('data', handler)
})
.concatMap((data) => data.Contents)
.pluck('Key')
.take(4)
.bufferWithCount(2)
.flatMap(x => x)
.flatMap((key) => {
  console.log('key', key)
  let params = {
    localFile: opts.output + key.substring(key.lastIndexOf('/')),
    s3Params: {
      'Bucket': 'tvg-bd-globocom',
      'Key': key
    }
  }
  
  function progress() {
    // console.log('progress', key, downloader.progressAmount, downloader.progressTotal)
  }

  console.log('downloading file', params)
  let downloader = client.downloadFile(params)
  return Rx.Observable.fromEventPattern((handler) => {
    downloader.addListener('progress', progress)
    downloader.addListener('end', handler)
  }, (handler) => {
    downloader.removeListener('progress', progress)
    downloader.removeListener('end', handler)
  }, () => {
    return key
  })
})
.subscribe((key) => {
  console.log('download done', key)
}, (err) => {
  console.log('ERROR', err)
}, () => {
  console.log('COMPLETED')
})
