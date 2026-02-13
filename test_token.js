async function testToken() {
    const token = 'sb_secret_hzRMSNhTg0TVu23k46npSA_fLf-TYNx';
    try {
        const response = await fetch('https://api.supabase.com/v1/projects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('SUCCESS:', JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log('FAILED:', response.status, text);
        }
    } catch (err) {
        console.log('ERROR:', err.message);
    }
}

testToken();
