# LB Presigned

A FiveM script to generate presigned URLs for uploading files to S3.

## Configuration

### Cloudflare R2

To use Cloudflare R2, add the following convars to your server.cfg:

```cfg
set LB_R2_BUCKET bucket_name
set LB_R2_ACCOUNT_ID account_id
set LB_R2_ACCESS_KEY_ID access_key_id
set LB_R2_SECRET_ACCESS_KEY secret_access_key
set LB_R2_DOMAIN r2.example.com
```

You can get your tokens at https://developers.cloudflare.com/r2/api/tokens

### AWS S3

To use AWS S3, add the following convars to your server.cfg:

```cfg
set LB_S3_BUCKET bucket_name
set LB_S3_REGION region
set LB_S3_ACCESS_KEY_ID access_key_id
set LB_S3_SECRET_ACCESS_KEY secret_access_key
set LB_S3_DOMAIN s3.example.com # optional
```

You can get your tokens at https://aws.amazon.com/s3/

## Installation

1. Download the latest release from the [releases page](https://github.com/lbphone/lb-presigned/releases/latest/download/lb-presigned.zip)
2. Add the script to your `resources` folder
3. Add `start lb-presigned` to your `server.cfg`
4. [Configure](#configuration) your credentials as described above
5. Start your server, or run `refresh` and `ensure lb-presigned` in your server console

## Usage

### Exports

`GeneratePresignedUrl(mimeType: string): { presignedUrl: string, fileUrl: string }`

```lua
local result = exports["lb-presigned"]:GeneratePresignedUrl("image/webp")

print(result.presignedUrl) -- URL to upload the file
print(result.fileUrl) -- URL to access the file after it's uploaded
```

### LB Tablet

> [!IMPORTANT]
> This requires LB Tablet v1.6.0 or higher.

1. [Install](#installation) & [configure](#configuration) LB Presigned as described above
2. Set `Config.UploadMethod.Video` to `LBPresigned`
3. Restart your server, or run `ensure lb-tablet` in your server console

### LB Phone

> [!IMPORTANT]
> This requires LB Phone v1.5.5 or higher.

1. [Install](#installation) & [configure](#configuration) LB Presigned as described above
2. Set `Config.UploadMethod.Video` to `LBPresigned`
3. Restart your server, or run `ensure lb-phone` in your server console
