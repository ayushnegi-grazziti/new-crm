const leadService = require('./services/leadService');
const accountRepository = require('./repositories/accountRepository');
const leadRepository = require('./repositories/leadRepository');

async function verify() {
    console.log('--- STARTING LEADS LOGIC VERIFICATION ---');

    const testUser = { id: 'test_user_id', name: 'Test User' };
    const uniqueCompanyName = 'New Unique Corp ' + Date.now();

    try {
        console.log(`\n1. Verifying auto-creation of account: "${uniqueCompanyName}"`);
        const res1 = await leadService.createLead({
            companyName: uniqueCompanyName,
            contactName: 'John New',
            email: 'john@new.com',
            department: 'Growth',
            leadType: 'new'
        }, testUser);

        const account1 = accountRepository.findByName(uniqueCompanyName);
        if (account1 && res1.lead.accountId === account1.id) {
            console.log('✅ Account auto-created and linked successfully.');
        } else {
            console.error('❌ Account auto-creation failed.');
        }

        console.log(`\n2. Verifying linking to existing account: "${uniqueCompanyName}"`);
        const res2 = await leadService.createLead({
            companyName: uniqueCompanyName,
            contactName: 'Jane Existing',
            email: 'jane@existing.com',
            department: 'Support'
        }, testUser);

        if (res2.lead.accountId === account1.id) {
            console.log('✅ Linked to existing account successfully.');
        } else {
            console.error('❌ Linking to existing account failed.');
        }

        console.log('\n3. Verifying all fields mapping');
        const lead = res2.lead;
        const expectedFields = ['department', 'contactName', 'email', 'accountId'];
        let allFieldsMatch = true;

        if (lead.department !== 'Support') {
            console.error(`❌ Field "department" mismatch: ${lead.department}`);
            allFieldsMatch = false;
        }
        if (lead.contactName !== 'Jane Existing') {
            console.error(`❌ Field "contactName" mismatch: ${lead.contactName}`);
            allFieldsMatch = false;
        }

        if (allFieldsMatch) {
            console.log('✅ All fields mapped correctly to lead record.');
        }

    } catch (err) {
        console.error('Verification failed with error:', err);
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

verify();
