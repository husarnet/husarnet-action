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
        const removeHost = core.getInput('remove-host');
        const login = core.getInput('dashboard-login');
        const password = core.getInput('dashboard-password');

        if (removeHost == 'true') {
            // Only proceed if both login and password are defined
            if (login && password) {
                // Login to Husarnet dashboard
                await exec.exec(`husarnet dashboard login ${login} ${password}`);

                let parsedLocalIp;
                try {
                    const response = await fetchAPIStatus();
                    parsedLocalIp = response.result.local_ip;
                } catch (err) {
                    console.error('Error fetching API status:', err);
                    core.setFailed("Timeout reached while waiting for API");
                    return;
                }

                console.log("removing: " + parsedLocalIp);

                if (parsedLocalIp) {
                    await exec.exec(`husarnet dashboard device rm ${parsedLocalIp}`);
                } else {
                    console.error('Failed to retrieve local IP.');
                }
            } else {
                console.log("Both 'dashboard-login' and 'dashboard-password' must be defined to remove the host from the Husarnet group.");
            }
        }

        await exec.exec('sudo systemctl stop husarnet');

    } catch (error) {
        core.setFailed(error.message);
    }

}

run();
