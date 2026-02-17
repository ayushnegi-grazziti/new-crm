const contactRepository = require('../repositories/contactRepository');
const leadRepository = require('../repositories/leadRepository');
const opportunityRepository = require('../repositories/opportunityRepository');

class ContactService {
    createContact(data, user) {
        return contactRepository.create({
            ...data,
            ownerId: user.id
        });
    }

    getContacts() {
        return contactRepository.getAll();
    }

    updateContact(id, data) {
        const contact = contactRepository.update(id, data);

        // Propagate financial updates to associated Opportunity and Lead
        if (contact && (data.closedWonRevenue || data.closedLostRevenue)) {
            const leads = leadRepository.getAll();
            const associatedLead = leads.find(l => l.contactId === id);

            if (associatedLead) {
                // Update Opportunity
                if (associatedLead.opportunityId) {
                    opportunityRepository.update(associatedLead.opportunityId, {
                        value: parseFloat(data.closedWonRevenue || 0),
                        stage: data.closedWonRevenue ? 'Closed Won' : 'Closed Lost',
                        closeDate: new Date().toISOString()
                    });
                }

                // Update Lead Status
                leadRepository.update(associatedLead.id, {
                    status: data.closedWonRevenue ? 'Closed Won' : 'Closed Lost'
                });
            }
        }

        return contact;
    }
}

module.exports = new ContactService();
