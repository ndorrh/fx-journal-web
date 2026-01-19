import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filename = searchParams.get('filename');
        const contentType = searchParams.get('contentType');

        if (!filename || !contentType) {
            return NextResponse.json({ error: 'Filename and content type are required' }, { status: 400 });
        }

        // Upload to 'temp/' folder initially. We will promote to 'setups/' on save.
        const key = `temp/${Date.now()}-${filename.replace(/\s+/g, '-')}`;

        const putCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const signedUrl = await getSignedUrl(S3, putCommand, { expiresIn: 600 }); // 10 minutes

        return NextResponse.json({
            uploadUrl: signedUrl,
            publicUrl: `${R2_PUBLIC_URL}/${key}`,
        });
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // "Promote" action: Move file from temp/ to setups/
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Extract Key from URL
        // https://pub.r2.dev/temp/123.png -> temp/123.png
        const urlObj = new URL(url);
        const sourceKey = urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;

        // Verify it is a temp file
        if (!sourceKey.startsWith('temp/')) {
            return NextResponse.json({ success: true, url: url }); // Already promoted or external
        }

        const destinationKey = sourceKey.replace('temp/', 'setups/');

        // 1. Copy Object
        await S3.send(new CopyObjectCommand({
            Bucket: R2_BUCKET_NAME,
            CopySource: `${R2_BUCKET_NAME}/${sourceKey}`,
            Key: destinationKey,
        }));

        // 2. Delete Old Object (Async, don't block heavily)
        await S3.send(new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: sourceKey,
        }));

        return NextResponse.json({
            success: true,
            publicUrl: `${R2_PUBLIC_URL}/${destinationKey}`
        });

    } catch (error) {
        console.error('Error promoting object:', error);
        return NextResponse.json({ error: 'Failed to promote object' }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        const deleteCommand = new DeleteObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
        });

        await S3.send(deleteCommand);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting object:', error);
        return NextResponse.json({ error: 'Failed to delete object' }, { status: 500 });
    }
}
