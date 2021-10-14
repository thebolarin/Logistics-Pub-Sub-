const { PubSub, v1 } = require("@google-cloud/pubsub");
const pubSubClient = new PubSub();
const pubSubClient2 = new v1.PublisherClient();
const topicName = "orders_topic";
const numeral = require('numeral');

const pubsubRepository = require("../repositories/pub-sub-repo");

const { publishMessage } = pubsubRepository;

module.exports = {
    orders: (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Orders route confirmed :)",
        })
    },

    createOrders: async (req, res) => {
        

        let otherFees = 0;
        let runningBalance = 0;
        let transfer = {
            vat:10,
            fees: 10,
            stampDuty: 5,
            amount: 20000,
            narration: '',
            creditAccountName: 'moses odutusin',
        }

        let debitAccount = {
            accountNumber: '0156748879',
            currencyCode: 'NGN'
        }

        let client = {
            _id: 'mkeru93853jr3kmre',
            phoneNumber: '+23408147793653'
        }

        let account = {
            accountBalance: 50000
        }

        if(Number(transfer.fees) > 0) {
            otherFees = (Number(otherFees) + Number(transfer.fees));
            runningBalance = (Number(debitAccount.accountBalance) + Number(transfer.vat) + Number(transfer.stampDuty));
        }
        
        if(Number(transfer.vat) > 0) {
            otherFees = (Number(otherFees)  + Number(transfer.vat) );
            runningBalance = (Number(debitAccount.accountBalance) + Number(transfer.stampDuty));
        }
        
        if(Number(transfer.stampDuty) > 0) {
            otherFees = (Number(otherFees) + Number(transfer.stampDuty));
            runningBalance = (Number(debitAccount.accountBalance));
        }


        const fullSmsTemplate = `Acct: ******${debitAccount.accountNumber.substr(-4)}\nAmt: ${debitAccount.currencyCode} ${numeral(transfer.amount).format('0,0.00')} DR, COMM + VAT = ${numeral(otherFees).format('0,0.00')}\nDesc: Internal Fund Transfer|${transfer.narration}|${transfer.creditAccountName}\nAvail Bal: ${debitAccount.currencyCode} ${numeral(runningBalance).format('0,0.00')} \n#SafeBanking`;




        let ordersObj = {
            channels: ["SMS"],
            sender: "SafeHaven",
            sms_type: "TRANSACTION",
            company: "SAFEHAVEN",
            recipient: {
                client_id: client._id,
                phoneNumber: [client.phoneNumber]
            },
            smsTemplate: fullSmsTemplate
        }




        let messageId = await publishMessage(pubSubClient, topicName, ordersObj);
        return res.status(200).json({
            success: true,
            message: `Message ${messageId} published :)`
        })
    },

};