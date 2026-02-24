const opportunityRepository = require('../repositories/opportunityRepository');

class OpportunityService {
    createOpportunity(data, user) {
        return opportunityRepository.create({
            ...data,
            ownerId: user.id
        });
    }

    async getOpportunities() {
        const all = await opportunityRepository.getAll();
        // Requirement: Only display records transferred using MOVE TO OPPORTUNITY (must have originalLeadId)
        return all.filter(opp => opp.originalLeadId);
    }

    getOpportunity(id) {
        return opportunityRepository.getById(id);
    }

    async updateOpportunityDetails(id, updateData) {
        // Ensure we support all the new schema fields and discussion notes
        return opportunityRepository.update(id, {
            ...updateData,
            updatedAt: new Date().toISOString()
        });
    }

}

module.exports = new OpportunityService();
