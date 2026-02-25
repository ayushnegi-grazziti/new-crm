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
        const updatedOpp = await opportunityRepository.update(id, {
            ...updateData,
            updatedAt: new Date().toISOString()
        });

        // 2. Propagate shared fields back to the Lead
        if (updatedOpp.originalLeadId) {
            const leadRepository = require('../repositories/leadRepository');
            const sharedFields = {
                fteCount: updatedOpp.fteCount,
                expectedHours: updatedOpp.nonFteHours,
                nonFte: updatedOpp.nonFte,
                salesManager: updatedOpp.pmAm,
                deliveryManager: updatedOpp.deliveryOwner,
                department: updatedOpp.primaryTeam,
                comments: updatedOpp.comments || updatedOpp.notes,
                updatedAt: new Date().toISOString()
            };

            leadRepository.update(updatedOpp.originalLeadId, sharedFields);
        }

        return updatedOpp;
    }

}

module.exports = new OpportunityService();
