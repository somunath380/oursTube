const { getMinioClient } = require('./dist/db/index.js');
const { config } = require('./dist/config/env.js');

async function testMinioConnection() {
    console.log('Testing MinIO connection...');
    console.log('MinIO Config:', {
        endPoint: config.MINIO_HOST,
        port: config.MINIO_PORT,
        accessKey: config.MINIO_USER,
        bucket: config.MINIO_VIDEO_UPLOAD_BUCKET_NAME
    });
    
    try {
        const client = getMinioClient();
        console.log('✅ MinIO client created successfully');
        
        const buckets = await client.listBuckets();
        console.log('✅ MinIO connection successful. Available buckets:', buckets.map(b => b.name));
        
        // Test bucket creation if it doesn't exist
        const bucketExists = await client.bucketExists(config.MINIO_VIDEO_UPLOAD_BUCKET_NAME);
        if (!bucketExists) {
            console.log(`Creating bucket: ${config.MINIO_VIDEO_UPLOAD_BUCKET_NAME}`);
            await client.makeBucket(config.MINIO_VIDEO_UPLOAD_BUCKET_NAME);
            console.log(`✅ Bucket ${config.MINIO_VIDEO_UPLOAD_BUCKET_NAME} created successfully`);
        } else {
            console.log(`✅ Bucket ${config.MINIO_VIDEO_UPLOAD_BUCKET_NAME} already exists`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ MinIO connection failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

testMinioConnection(); 