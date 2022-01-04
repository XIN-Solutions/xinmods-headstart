const _ = require('lodash');
const os = require('os');
const AWS = require('aws-sdk');
const S3 = new AWS.S3({apiVersion: "2006-03-01"});

// 5 minutes ping interval
const HostPingInterval = 60 * 1000 * 5;

// bucket and baseFolder for storing the host ping files.
const bucket = process.env.HOST_PING_BUCKET || null;
const baseFolder = process.env.HOST_PING_KEY || null;

module.exports = {

    /**
     * Get a list of active hostnames from S3.
     *
     * @param includeSelf {boolean} decide whether to include this host in the list of returned items.
     */
    async getActiveHostnames(includeSelf = false) {
		if (!bucket || !baseFolder) {
			throw new Error("Should set HOST_PING_BUCKET and HOST_PING_KEY");
		}

        const ownHostname = os.hostname();
        const currentTime = Date.now();
        const hosts = [];

        try {

            const results = await S3.listObjects({Bucket: bucket, Prefix: baseFolder}).promise();

            for (const hostObject of results.Contents) {

                const lastModStamp = hostObject.LastModified.getTime();
                const timeSinceStamp = currentTime - lastModStamp;

                // if a server hasn't written for five times, it's still considered an active server
                if (timeSinceStamp < HostPingInterval * 5) {
                    const remoteHostname = _.last(hostObject.Key.split("/"));

                    // found myself, but shouldn't be included? skip.
                    if (!includeSelf && remoteHostname === ownHostname) {
                        continue;
                    }

                    hosts.push(remoteHostname);
                }
            }

        }
        catch (err) {
            console.error("Cannot retrieve hostnames:", err);
        }

        return hosts;
    },

    /**
     * Write the internal hostname to S3.
     */
    async writeHostname() {
		if (!bucket || !baseFolder) {
			throw new Error("Should set HOST_PING_BUCKET and HOST_PING_KEY");
		}

        const hostname = os.hostname();

        try {
            await S3.putObject({Bucket: bucket, Key: `${baseFolder}/${hostname}`, Body: "*ping*"}).promise();
            console.log(`Completed writing hostname being active: ${hostname}`);

            console.log(`All active hostnames are: ${await this.getActiveHostnames(true)}`);
        }
        catch (err) {
            console.error(`Could not write hostname being active to S3: ${hostname}`);
        }
    },

    /**
     * Start sending hostnames.
     */
    start() {
		if (!bucket || !baseFolder) {
			throw new Error("Should set HOST_PING_BUCKET and HOST_PING_KEY");
		}

        setInterval(
            async () => {
                await this.writeHostname();
            }, HostPingInterval
        );

        this.writeHostname()
            .then(() => console.log("[background] Completed writing hostname to S3 webhook forwarding location"))
            .catch((err) => console.error("[background] Something went wrong: ", err));
    }

}
