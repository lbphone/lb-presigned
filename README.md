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

`GeneratePresignedUrl(mimeType: string, options?: { filename?: string }): { presignedUrl: string, fileUrl: string }`

```lua
local result = exports["lb-presigned"]:GeneratePresignedUrl("image/webp")

print(result.presignedUrl) -- URL to upload the file
print(result.fileUrl) -- URL to access the file after it's uploaded
```

If you don't pass `filename`, a random name will be generated. Filename is a name without a file extension. It can include folders, and may only contain letters, digits, `_`, `-` and `/`. A file that already has that name will be replaced.

```lua
local result = exports["lb-presigned"]:GeneratePresignedUrl("image/webp", { filename = "outfits/abc123" })

print(result.fileUrl)
```

`CanDeleteFile(url: string): boolean`

Checks if `url` points to the configured bucket and has a name that `GeneratePresignedUrl` can give. Note that this does not mean that the file exists.

`DeleteFile(url: string): boolean`

Deletes a file in the configured bucket. Returns `true` when the file was deleted or didn't exist, and false when `CanDeleteFile` is false for the URL or deleting failed. Note that the access key needs permission to delete objects (`s3:DeleteObject` on S3, an "Object Read & Write" token on R2).

```lua
local url = result.fileUrl

if exports["lb-presigned"]:CanDeleteFile(url) then
    exports["lb-presigned"]:DeleteFile(url)
end
```

### LB Tablet

> [!IMPORTANT]
> This requires LB Tablet v1.6.0 or higher.

1. [Install](#installation) & [configure](#configuration) LB Presigned as described above
2. Set all `Config.UploadMethod` to `LBPresigned`
3. Restart your server, or run `ensure lb-tablet` in your server console

### LB Phone

> [!IMPORTANT]
> This requires LB Phone v2.5.5 or higher.

1. [Install](#installation) & [configure](#configuration) LB Presigned as described above
2. Set all `Config.UploadMethod` to `LBPresigned`
3. Restart your server, or run `ensure lb-phone` in your server console
