const AWS = require('aws-sdk');
const SES = new AWS.SES({apiVersion: "2010-12-01"});
const juice = require('juice');

class EmailService {

    /**
     * Initialise data-members
     */
    constructor() {

    }

    /**
     * Send an email to someone using a specific template that has a number of values inserted.
     *
     * @param customer {object} the customer information.
     * @param to {string} the email address
     * @param htmlTemplate {string} the name of the template
     * @param values {object} the values to insert into the template
     */
    async sendEmail(app, customer, from, to, subject, htmlTemplate = null, values) {

        console.log(`Sending an email to ${to}, of template: ${htmlTemplate}, with values: `, values);

        return new Promise(async (resolve, reject) => {

            app.render(htmlTemplate, values, function(err, htmlContents) {

                if (err) {
                    reject(err);
                    return;
                }

                const inlinedHtml = juice(htmlContents);

                // send the email.
                SES.sendEmail({
                    Source: from,
                    Destination: {ToAddresses: [to]},
                    Message: {
                        Subject: {Data: subject},
                        Body: {
                            Html: {
                                Data: inlinedHtml
                            }
                        }

                    }
                })
                .promise()
                    .then(resolve)
                    .catch(reject)
                ;

            });


        });

    }

}

module.exports = EmailService;
