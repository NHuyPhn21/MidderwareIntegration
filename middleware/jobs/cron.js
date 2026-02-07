import nodeCron from 'node-cron';
import axios from 'axios';

const startCronJobs = (port) => {
    console.log('⏰ Initializing Cron Jobs...');

    // Schedule Sync Init: Daily at 2:00 AM
    nodeCron.schedule('0 2 * * *', async () => {
        console.log('⏰ [Cron] Starting Daily Health Check Sync Init...');
        try {
            const hrUrl = `http://localhost:${port}/api/gateway/health-check/sync/init`;
            await axios.post(hrUrl);
            console.log('✅ [Cron] Sync Init Triggered Successfully');
        } catch (error) {
            console.error('❌ [Cron] Sync Init Failed:', error.message);
        }
    });

    // Schedule Sync Results: Hourly
    nodeCron.schedule('0 * * * *', async () => {
        console.log('⏰ [Cron] Starting Hourly Health Check Result Sync...');
        try {
            const hrUrl = `http://localhost:${port}/api/gateway/health-check/sync/results`;
            await axios.post(hrUrl);
            console.log('✅ [Cron] Sync Results Triggered Successfully');
        } catch (error) {
            console.error('❌ [Cron] Sync Results Failed:', error.message);
        }
    });
};

export default startCronJobs;
