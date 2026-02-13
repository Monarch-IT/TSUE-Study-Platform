const fs = require('fs');
const https = require('https');

// Configuration
const BRIDGE_SECRET = "super_secret_sql_bridge_token_2026";
// IMPORTANT: Replace with your actual deployed backend URL (e.g. Render/Heroku)
const DEFAULT_URL = "http://localhost:8000/api/admin/sql";

async function runRemoteSql() {
    const args = process.argv.slice(2);
    let sql = "";
    let url = process.env.BRIDGE_URL || DEFAULT_URL;

    if (args.length === 0) {
        console.log("Usage:");
        console.log("  node remote_sql.cjs \"SELECT * FROM users\" [URL]");
        console.log("  node remote_sql.cjs -f path/to/file.sql [URL]");
        return;
    }

    if (args[0] === "-f") {
        const filePath = args[1];
        if (!fs.existsSync(filePath)) {
            console.error(`Error: File not found - ${filePath}`);
            process.exit(1);
        }
        sql = fs.readFileSync(filePath, 'utf8');
        if (args[2]) url = args[2];
    } else {
        sql = args[0];
        if (args[1]) url = args[1];
    }

    console.log(`Connecting to Cloud Bridge: ${url}`);

    const urlObj = new URL(url);
    const postData = JSON.stringify({ sql, secret: BRIDGE_SECRET });
    const protocol = urlObj.protocol === 'https:' ? require('https') : require('http');

    const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = protocol.request(options, (res) => {
        let body = '';
        res.on('data', (d) => { body += d; });
        res.on('end', () => {
            try {
                const response = JSON.parse(body);
                if (response.success) {
                    console.log("\n✅ SQL EXECUTED SUCCESSFULLY");
                    console.log(`Command: ${JSON.stringify(response.command)}`);
                    console.log(`Rows affected: ${JSON.stringify(response.rowCount)}`);
                    if (response.data && response.data.length > 0) {
                        console.table(Array.isArray(response.data[0]) ? response.data[0] : response.data);
                    }
                } else {
                    console.error("\n❌ SQL ERROR");
                    console.error(response.error);
                    if (response.details) console.error(`Details: ${response.details}`);
                }
            } catch (e) {
                console.error("\n❌ FAILED TO PARSE RESPONSE");
                console.error(body);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`\n❌ BRIDGE REQUEST FAILED: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

runRemoteSql();
