const fs = require('fs')
const log = require('single-line-log').stdout
const s3 = require('s3')

let opts = require('./opts')

let downloadQueue = []

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
lister.addListener('data', listerHandler)
lister.addListener('end', listEnded)

function listerHandler(data) {
  downloadQueue = downloadQueue.concat(data.Contents.map((content) => ({key: content.Key, size: content.Size, progress: 0})))
}

function listEnded() {
  total = downloadQueue.length
  console.log(`Found ${total} files in ${opts.key}. Starting ${opts.maxConcurrent} downloads`)
  printProgress()
  for (let i = 0; i < opts.maxConcurrent; i++) {
    nextDownload()
  }
}


let downloading = []
let total = -1
function nextDownload() {
  if (downloading.length > opts.maxConcurrent) { return }
  if (downloadQueue.length === 0) { return }

  let item = downloadQueue.shift()

  let outFile = opts.output + item.key.substring(item.key.lastIndexOf('/'))
  fs.stat(outFile, (err, stat) => {
    if (err) {
      if (err.code === 'ENOENT') {
        download(item, outFile)
      }
    } else {
      if (stat.size !== item.size) {
        fs.unlink(outFile, () => {
          download(item, outFile)
        })
      } else {
        nextDownload()
      }
    }
  })
}

function download(item, outFile) {
  downloading.push(item)
  let params = {
    localFile: outFile,
    s3Params: {
      'Bucket': 'tvg-bd-globocom',
      'Key': item.key
    }
  }

  let downloader = client.downloadFile(params)
  downloader.addListener('progress', downloadProgress.bind(null, downloader, item))
  downloader.addListener('error', downloadError.bind(null, item))
  downloader.addListener('end', downloadDone.bind(null, item))
}

function downloadProgress(downloader, item) {
  item.progress = (downloader.progressAmount / downloader.progressTotal * 100)
}

function downloadDone(item) {
  downloading.splice(downloading.indexOf(item), 1)
  nextDownload()
}

function downloadError(item, err) {
  console.log('download error', item.key.substr(-10), err)
  downloading = downloading.without(item)
  downloadQueue.push(item)
  nextDownload()
}

function printProgress() {
  let actual = total-downloadQueue.length
  let msg = 'Downloading '+ (actual) + ' of ' + total + ': ' + (actual/total*100).toFixed(1) + '% - concurrency ' + downloading.length
  if (downloading.length) {
    msg += '\nProgress:'
  }

  downloading.forEach((item) => {
    msg += `\n${item.key.substr(-10)}: ${item.progress.toFixed(1)}%`
  })

  log(msg)
  setImmediate(printProgress)
}
