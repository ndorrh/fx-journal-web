# Cloudflare R2 Storage Setup Guide

This project uses Cloudflare R2 for storing trade images securely and cost-effectively. Follow these steps to configure your environment.

## 1. Create R2 Bucket
1.  Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Navigate to **R2** from the sidebar.
3.  Click **Create Bucket**.
4.  Name your bucket (e.g., `fx-journal-images`).
5.  Click **Create Bucket**.

## 2. API Tokens
You need an API token with read/write permissions for your bucket.
1.  In the R2 dashboard, look for **Manage R2 API Tokens** (usually on the right side).
2.  Click **Create API Token**.
3.  Select **Admin Read & Write** permissions (or customize to allow Object Read/Write).
4.  Set TTL to "Forever" or as desired.
5.  Click **Create API Token**.
6.  **IMPORTANT:** Copy the following values immediately:
    *   `Access Key ID`
    *   `Secret Access Key`
    *   `Endpoint` (Use the S3 API endpoint specific to your bucket/account)

## 3. Environment Variables
Add the following credentials to your `.env.local` file:

```env
# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=your_bucket_name_here
# Public URL for accessing images (Custom Domain or R2.dev subdomain)
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

## 4. CORS Configuration
To allow the browser to upload directly to R2 (for better performance), you must configure CORS.

### Option A: Manual Setup (Dashboard)
1.  Go to your Bucket Settings in Cloudflare.
2.  Find **CORS Policy**.
3.  Add the following JSON:
    ```json
    [
      {
        "AllowedOrigins": [
          "http://localhost:3000",
          "https://your-production-domain.com"
        ],
        "AllowedMethods": [
          "GET",
          "PUT",
          "DELETE",
          "HEAD"
        ],
        "AllowedHeaders": [
          "*"
        ],
        "ExposeHeaders": [
          "ETag"
        ],
        "MaxAgeSeconds": 3000
      }
    ]
    ```

### Option B: Script Setup
We have included a script in the root of the project: `configure-r2-cors.js`.
1.  Ensure your `.env.local` is set with `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`.
2.  Run the script:
    ```bash
    node configure-r2-cors.js
    ```

## 5. Verification
1.  Start the app (`npm run dev`).
2.  Go to **Log Trade**.
3.  Try uploading an image to the "Setup Chart" field.
4.  If successful, the image preview will appear.
