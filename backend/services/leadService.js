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

            // 3. Create Lead (No auto-opportunity)
            const lead = leadRepository.create({
                companyName,
                contactName: contactName || 'N/A',
                email: email || '',
                phone: phone || '',
                status: 'New',
                ownerId: user?.id || 'system',
                accountId: account.id,
                contactId: contact.id,
                opportunityId: null, // No opportunity yet
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
                estimatesLink: leadData.estimatesLink,
                description: description || ''
            });
            console.log('Created lead successfully:', lead.id);

            return { lead, account, contact };
        } catch (error) {
            console.error('CRITICAL ERROR in createLead:', error);
            throw error;
        }
    }

    async convertLead(id, user) {
        try {
            const lead = leadRepository.getById(id);
            if (!lead) throw new Error('Lead not found');
            if (lead.status === 'Converted') throw new Error('Lead already converted');

            // 1. Create the Opportunity
            const opportunity = opportunityRepository.create({
                accountId: lead.accountId,
                contactId: lead.contactId,
                originalLeadId: lead.id,
                oppName: `Deal - ${lead.companyName}`,
                description: lead.description || lead.comments || '',
                service: '', // Tech/Service to be filled later
                primaryTeam: lead.department || '',
                deliveryOwner: lead.deliveryManager || '',
                fteCount: lead.fteCount || 0,
                nonFteHours: lead.expectedHours || 0,
                pmAm: lead.salesManager || '',
                status: 'New',
                skillTech: '',
                downtrendReason: '',
                pmToolLink: '',
                projectPlanLink: '',
                projectFolderLink: '',
                gitLink: lead.gitLink || '',
                codeReviewDate: null,
                codeReviewOwner: '',
                comments: lead.comments || '',
                lastModifiedBy: user?.name || 'system',
                lastModifiedDate: new Date().toISOString(),
                // New discussion fields
                products: '',
                notes: ''
            });

            // 2. Update Lead status and ref
            leadRepository.update(id, {
                status: 'Converted',
                opportunityId: opportunity.id
            });

            return { lead, opportunity };
        } catch (error) {
            console.error('Lead conversion error:', error);
            throw error;
        }
    }


    getAllLeads() {
        return leadRepository.getAll();
    }

    getLeadById(id) {
        return leadRepository.getById(id);
    }

    async updateLead(id, data, user) {
        try {
            const lead = leadRepository.getById(id);
            if (!lead) throw new Error('Lead not found');

            // 1. Update Lead record
            const updatedLead = leadRepository.update(id, data);

            // 2. Synchronize with Opportunity if it exists
            if (updatedLead.opportunityId) {
                const sharedFields = {
                    fteCount: updatedLead.fteCount,
                    nonFteHours: updatedLead.expectedHours, // note: backend uses nonFteHours for expectedHours in some places
                    pmAm: updatedLead.salesManager,
                    deliveryOwner: updatedLead.deliveryManager,
                    primaryTeam: updatedLead.department,
                    description: updatedLead.description || updatedLead.comments || '',
                    comments: updatedLead.comments,
                    updatedAt: new Date().toISOString()
                };

                // Specific nonFte mapping check
                if (updatedLead.nonFte !== undefined) {
                    sharedFields.nonFte = updatedLead.nonFte;
                }

                await opportunityRepository.update(updatedLead.opportunityId, sharedFields);
            }

            // 3. Update Contact if name/email/phone changed
            if (updatedLead.contactId && (data.contactName || data.email || data.phone || data.title)) {
                contactRepository.update(updatedLead.contactId, {
                    name: data.contactName || updatedLead.contactName,
                    email: data.email || updatedLead.email,
                    phone: data.phone || updatedLead.phone,
                    title: data.title || updatedLead.title
                });
            }

            // 4. Update Account if companyName changed
            if (updatedLead.accountId && data.companyName) {
                accountRepository.update(updatedLead.accountId, {
                    name: data.companyName
                });
            }

            return updatedLead;
        } catch (error) {
            console.error('Lead update error:', error);
            throw error;
        }
    }

    updateLeadStatus(id, status) {
        return leadRepository.update(id, { status });
    }
}

module.exports = new LeadService();
