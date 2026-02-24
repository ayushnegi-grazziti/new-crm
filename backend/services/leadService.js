const leadRepository = require('../repositories/leadRepository');
const accountRepository = require('../repositories/accountRepository');
const contactRepository = require('../repositories/contactRepository');
const opportunityRepository = require('../repositories/opportunityRepository');

class LeadService {
    async createLead(leadData, user) {
        try {
            console.log('Creating lead with data:', JSON.stringify(leadData, null, 2));
            const { companyName, contactName, email, phone, title, description } = leadData;

            if (!companyName) {
                throw new Error('Company Name is required');
            }

            // 1. Check if Account exists
            let account = accountRepository.findByName(companyName);
            console.log(`Account lookup for "${companyName}":`, account ? `Found (ID: ${account.id})` : 'Not found (will create)');

            if (!account) {
                // Create new Account
                account = accountRepository.create({
                    name: companyName,
                    ownerId: user?.id || 'system',
                    status: 'New'
                });
                console.log('Created new account:', account.id);
            }

            // 2. Create Contact
            const contact = contactRepository.create({
                accountId: account.id,
                name: contactName || 'N/A',
                email: email || '',
                phone: phone || '',
                title: title || '',
                ownerId: user?.id || 'system'
            });
            console.log('Created contact:', contact.id);

            // 3. Create Opportunity
            const opportunity = opportunityRepository.create({
                accountId: account.id,
                name: `Deal - ${companyName}`,
                stage: 'Prospect',
                value: 0,
                closeDate: null,
                ownerId: user?.id || 'system',
                description: description || ''
            });
            console.log('Created opportunity:', opportunity.id);

            // 4. Create Lead
            const lead = leadRepository.create({
                companyName,
                contactName: contactName || 'N/A',
                email: email || '',
                phone: phone || '',
                status: 'New',
                ownerId: user?.id || 'system',
                accountId: account.id,
                contactId: contact.id,
                opportunityId: opportunity.id,
                // Include other fields if present in leadData
                department: leadData.department,
                leadType: leadData.leadType,
                salesManager: leadData.salesManager,
                deliveryManager: leadData.deliveryManager,
                fteCount: leadData.fteCount,
                nonFte: leadData.nonFte,
                expectedHours: leadData.expectedHours,
                contractType: leadData.contractType,
                comments: leadData.comments,
                proposalLink: leadData.proposalLink,
                estimatesLink: leadData.estimatesLink
            });
            console.log('Created lead successfully:', lead.id);

            return { lead, account, contact, opportunity };
        } catch (error) {
            console.error('CRITICAL ERROR in createLead:', error);
            throw error;
        }
    }

    getAllLeads() {
        return leadRepository.getAll();
    }

    getLeadById(id) {
        return leadRepository.getById(id);
    }

    updateLeadStatus(id, status) {
        return leadRepository.update(id, { status });
    }
}

module.exports = new LeadService();
