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

async function run() {
    try {
        // Install Husarnet
        await exec.exec('wget https://install.husarnet.com/tgz/husarnet-2.0.170-amd64.tar');
        await exec.exec('sudo tar --directory=/ --no-same-owner --dereference -xf husarnet-2.0.170-amd64.tar');
        await exec.exec('sudo /.scripts/after_install');

        // Check if API is ready
        let endTime = Date.now() + 30000; // 30 seconds from now

        while (Date.now() < endTime) {
            try {
                const response = await fetchAPIStatus();
                console.log(response);
                if (response.result.is_ready_to_join) {
                    console.log("The service is ready!");
                    return;
                }
            } catch (err) {
                console.error('Error fetching API status:', err);
            }
    
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.error("Timeout reached!");
        core.setFailed("Timeout reached while waiting for API");

        // Joining to Husarnet network
        const joinCode = core.getInput('join-code');
        const hostname = core.getInput('hostname', { required: true });

        if (hostname === 'default-hostname') {
            const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
            await exec.exec(`sudo husarnet join ${joinCode} github-actions-${repoName}`);
        } else {
            await exec.exec(`sudo husarnet join ${joinCode} ${hostname}`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
