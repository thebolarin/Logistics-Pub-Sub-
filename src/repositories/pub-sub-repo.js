module.exports = {
    publishMessage: async (pubSubClient, topicName, payload) => {
        const dataBuffer = Buffer.from(JSON.stringify(payload));

        const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
        console.log(`Message ${messageId} published.`);
        return messageId;
    },

    listenForPullMessages: async (pubSubClient, subscriptionName,  timeout) => {
        const subscription = pubSubClient.subscription(subscriptionName);

        let messageCount = 0;
        const messageHandler = message => {
            console.log(
                `Received message: id ${message.id}, data ${
                  message.data
                }, attributes: ${JSON.stringify(message.attributes)}`
              );

              const result = this.listenForPushMessages(message.data);
              console.log(result);
// let m = Buffer.from(message.data, 'base64').toString('utf-8');
//               let result = JSON.parse(m);
//           console.log(result.name);

            messageCount += 1;

            message.ack();
        };

        subscription.on('message', messageHandler);

        setTimeout(() => {
            subscription.removeListener('message', messageHandler);
            console.log(`${messageCount} message(s) received.`);
        }, timeout * 1000);
    },

    listenForPushMessages: (payload) => {
        const message = Buffer.from(payload, 'base64').toString(
            'utf-8'
        );
        let parsedMessage = JSON.parse(message);
        console.log(parsedMessage);
        return parsedMessage;
    }

};