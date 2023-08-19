const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
    try {
        const login = core.getInput('dashboard-login');
        const password = core.getInput('dashboard-password');

        // Only proceed if both login and password are defined
        if (login && password) {
            // Login to Husarnet dashboard
            await exec.exec(`husarnet dashboard login ${login} ${password}`);

            // Retrieve the local IP from Husarnet API and remove the device from dashboard
            let localIp = '';
            await exec.exec('curl -s 127.0.0.1:16216/api/status', [], {
                listeners: {
                    stdout: (data) => {
                        localIp += data.toString();
                    }
                }
            });
            const parsedLocalIp = JSON.parse(localIp).result.local_ip;
            if (parsedLocalIp) {
                await exec.exec(`husarnet dashboard device rm ${parsedLocalIp}`);
            } else {
                console.error('Failed to retrieve local IP.');
            }
        } else {
            console.log("Both 'dashboard-login' and 'dashboard-password' must be defined to proceed.");
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
