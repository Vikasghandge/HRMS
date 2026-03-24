const amqp = require('amqplib');

let channel = null;

// Connect to RabbitMQ
const connectPublisher = async () => {
  try {
    const connection = await amqp.connect('amqp://admin:admin123@rabbitmq:5672');
    channel = await connection.createChannel();
    
    await channel.assertQueue('notifications', { durable: true });
    
    console.log('✅ RabbitMQ Publisher connected');
  } catch (error) {
    console.error('❌ RabbitMQ Publisher failed:', error.message);
    // Retry connection
    setTimeout(connectPublisher, 5000);
  }
};

// Publish notification to queue
const publishNotification = async (type, data) => {
  try {
    if (!channel) {
      console.log('⚠️ Channel not ready, attempting to connect...');
      await connectPublisher();
    }
    
    const message = JSON.stringify({ type, data });
    
    channel.sendToQueue('notifications', Buffer.from(message), {
      persistent: true
    });
    
    console.log(`📤 Published notification: ${type}`);
  } catch (error) {
    console.error('❌ Failed to publish notification:', error);
  }
};

module.exports = { connectPublisher, publishNotification };
