# S3 Downloader

Simple command line s3 downloader


```
npm install s3down
```

## Usage

Need to pass in the path to the AWS credential files OR the access key id and the secret access key.

s3down --credentials /path/to/credential/file --bucket BUCKET_NAME

s3down --access-key-id ACCESS_KEY_ID --secret-access-key SECRET_ACCESS_KEY --bucket BUCKET_NAME

### Options

```
-c, --credentials - Path to AWS credentials file
-a, --access-key-id - AWS access key id
-s, --secret-access-key - AWS secret access key
-b, --bucket - AWS bucket
-k, --key - AWS bucket key prefix
-o, --output - Path to download files to
```
