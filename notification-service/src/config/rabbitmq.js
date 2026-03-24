const amqp = require('amqplib');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  try {
    const RABBITMQ_URL = 'amqp://admin:admin123@rabbitmq:5672';
    
    console.log('🔄 Connecting to RabbitMQ...');
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Assert queue exists
    await channel.assertQueue(process.env.QUEUE_NAME || 'notifications', {
      durable: true
    });
    
    console.log('✅ Connected to RabbitMQ successfully!');
    return channel;
  } catch (error) {
    console.error('❌ RabbitMQ connection failed:', error.message);
    // Retry after 5 seconds
    setTimeout(connectRabbitMQ, 5000);
  }
};

const getChannel = () => channel;

const closeConnection = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};

module.exports = { connectRabbitMQ, getChannel, closeConnection };
