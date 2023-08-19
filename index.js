const core = require('@actions/core');
const exec = require('@actions/exec');
const http = require('http');

async function fetchAPIStatus() {
    return new Promise((resolve, reject) => {
        http.get('http://127.0.0.1:16216/api/status', (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function fetchApiToken() {
    let apiToken = '';
    const options = {
        silent: true,  // prevents the command and its arguments from being displayed
        listeners: {
            stdout: (data) => {
                apiToken += data.toString().trim();
            }
        }
    };

    await exec.exec('sudo cat /var/lib/husarnet/daemon_api_token', [], options);
    
    core.setSecret(apiToken);  // masks the token value in logs

    return apiToken;
}

async function joinHusarnet(joinCode, hostname) {
    return new Promise(async (resolve, reject) => {
        let apiToken = fetchApiToken();

        const postData = `secret=${apiToken}&code=${joinCode}&hostname=${hostname}`;
        
        const options = {
            hostname: '127.0.0.1',
            port: 16216,
            path: '/api/join',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(responseData); // resolve with the response data
                } else {
                    reject(new Error(`Failed to join Husarnet. HTTP Status Code: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function run() {
    try {
        // Install Husarnet
        await exec.exec('wget https://install.husarnet.com/tgz/husarnet-2.0.170-amd64.tar');
        await exec.exec('sudo tar --directory=/ --no-same-owner --dereference -xf husarnet-2.0.170-amd64.tar');
        await exec.exec('sudo /.scripts/after_install');

        // Check if API is ready
        let isReady = false;
        let endTime = Date.now() + 30000; // 30 seconds from now

        while (Date.now() < endTime) {
            try {
                const response = await fetchAPIStatus();
                console.log(".")
                if (response.result.is_ready_to_join) {
                    console.log("The Husarnet service is ready to join!");
                    isReady = true;
                    break;  // exit the loop
                }
            } catch (err) {
                console.error('Error fetching API status:', err);
            }
    
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!isReady) {
            console.error("Timeout reached!");
            core.setFailed("Timeout reached while waiting for API");
            return;
        }

        // ... [Joining to Husarnet network logic]
        console.log("Joining to Husarnet network...");

        // Joining to Husarnet network
        const joinCode = core.getInput('join-code');
        const hostname = core.getInput('hostname', { required: true });
        let full_hostname;
        if (hostname === 'default-hostname') {
            const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
            full_hostname=`github-actions-${repoName}`;
        } else {
            full_hostname = hostname
        }

        try {
            await joinHusarnet(joinCode, full_hostname);
        } catch (error) {
            console.error('Failed to join Husarnet network', error);
            core.setFailed(error.message);
        }

        let isJoined = false;
        endTime = Date.now() + 30000; // 30 seconds from now

        while (Date.now() < endTime) {
            try {
                const response = await fetchAPIStatus();
                console.log(".")
                if (response.result.is_joined) {
                    console.log("The device is joined!");
                    isJoined = true;
                    break;  // exit the loop
                }
            } catch (err) {
                console.error('Error fetching API status:', err);
            }
    
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!isJoined) {
            console.error("Failed to join the device!");
            console.error("Check the limit for the number of devices at your account at https://app.husarnet.com");
            core.setFailed("Timeout reached while waiting for device to join");
        }

        try {
            const response = await fetchAPIStatus();
            core.setOutput('ipv6', response.result.local_ip);
        } catch (err) {
            console.error('Error fetching API status:', err);
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();