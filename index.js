// ... [Other module imports]

async function run() {
    try {
        // ... [Install Husarnet logic]

        // Check if API is ready
        let isReady = false;
        let endTime = Date.now() + 30000; // 30 seconds from now

        while (Date.now() < endTime) {
            try {
                const response = await fetchAPIStatus();
                if (response.result.is_ready_to_join) {
                    console.log("The service is ready!");
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

        let isJoined = false;
        endTime = Date.now() + 30000; // 30 seconds from now

        while (Date.now() < endTime) {
            try {
                const response = await fetchAPIStatus();
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
            core.setFailed("Timeout reached while waiting for device to join");
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
