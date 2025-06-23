const amqp = require('amqplib');

async function testConnection() {
    const url = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
    console.log(`Testing connection to: ${url}`);
    
    try {
        const connection = await amqp.connect(url);
        console.log('✅ Successfully connected to RabbitMQ!');
        
        const channel = await connection.createChannel();
        console.log('✅ Successfully created channel!');
        
        await channel.close();
        await connection.close();
        console.log('✅ Connection closed successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to connect to RabbitMQ:', error.message);
        process.exit(1);
    }
}

testConnection(); 