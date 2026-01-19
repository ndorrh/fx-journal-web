const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// 1. Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
        env[key] = value;
    }
});

const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME
} = env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    console.error("❌ Missing R2 credentials in .env.local");
    process.exit(1);
}

// 2. Initialize Client
const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

// 3. Define CORS Policy
const corsParams = {
    Bucket: R2_BUCKET_NAME,
    CORSConfiguration: {
        CORSRules: [
            {
                AllowedHeaders: ["*"],
                AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
                AllowedOrigins: ["*"], // Allow all origins for development (or set to http://localhost:3000)
                ExposeHeaders: ["ETag"],
                MaxAgeSeconds: 3000
            }
        ]
    }
};

// 4. Apply
async function run() {
    console.log(`Setting CORS for bucket: ${R2_BUCKET_NAME}...`);
    try {
        await S3.send(new PutBucketCorsCommand(corsParams));
        console.log("✅ CORS configuration applied successfully!");
        console.log("You can now upload images from the browser.");
    } catch (err) {
        console.error("❌ Error setting CORS:", err);
    }
}

run();
