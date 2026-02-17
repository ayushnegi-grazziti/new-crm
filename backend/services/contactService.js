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

        // Propagate financial updates to associated Opportunity via Lead
        if (contact && data.closedWonRevenue) {
            const leads = leadRepository.getAll();
            const associatedLead = leads.find(l => l.contactId === id);

            if (associatedLead && associatedLead.opportunityId) {
                opportunityRepository.update(associatedLead.opportunityId, {
                    value: parseFloat(data.closedWonRevenue),
                    stage: 'Closed Won',
                    closeDate: new Date().toISOString() // Ensure it appears in recent trends
                });
            }
        }

        return contact;
    }
}

module.exports = new ContactService();
