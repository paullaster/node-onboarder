
import User from "../../model/user.js";
import { Op } from "sequelize";
import NTLMSERVICE from "../../services/ntlm.service.js";
import { BCController } from "../bc/bc.controller.js";

export class ApplicationsController {
    async applications(req, res) {
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) return res.ApiResponse.error(401, "Unauthorized");
            const categoriesFilter = user['dataValues'].categoriesFilter.split("|");
            const countiesFilter = user['dataValues'].countiesFilter.split("|");
            let categoryFilterQuery;
            categoriesFilter.forEach((category) => {
                if (!categoryFilterQuery) {
                    categoryFilterQuery = `category eq '${category}'`;
                }else {
                    categoryFilterQuery += ` OR category eq '${category}'`;
                }
            })
            let countyFilterQuery;
            countiesFilter.forEach((county) => {
                if (!countyFilterQuery) {
                    countyFilterQuery = `countyOfOrigin eq '${county}'`;
                } else {
                    countyFilterQuery += ` OR countyOfOrigin eq '${county}'`;
                }
            })
            let filter = '';
            if (countyFilterQuery) {
                filter += `(${countyFilterQuery})`;
            }
            if (categoryFilterQuery  && req.user.role.toLowerCase() === 'hr' && !req.query.approved && !req.query.onboarding && !req.query.hrReviewed) {
                filter += filter? ` AND (status eq 'New')` : `AND (status eq 'New')`;
            }
            if (categoryFilterQuery  && req.user.role.toLowerCase() !== 'hr') {
                filter += filter? ` AND (${categoryFilterQuery}) AND (status eq 'New')` : `(${categoryFilterQuery}) AND (status eq 'New')`;
            }
            if (req.query.onboarding  && req.user.role.toLowerCase() === 'hr') {
                filter += filter? ` AND (status eq 'Onboarded')` : `AND (status eq 'Onboarded')`;
            }
            if (req.query.onboarding && req.user.role.toLowerCase() !== 'hr') {
                filter = `(onboardingConsortia eq '${req.user.belongsTo}') AND (status eq 'Onboarded')`;
            }
            if (req.query.approved  && req.user.role.toLowerCase() === 'hr') {
                filter += filter? ` AND (status eq 'Approved')` : `AND (status eq 'Approved')`;
            }
            if (req.query.approved && req.user.role.toLowerCase() !== 'hr') {
                filter = `(onboardingConsortia eq '${req.user.belongsTo}') AND (status eq 'Approved')`
            }
            if (req.query.hrReviewed && req.user.role.toLowerCase() === 'hr') {
                filter += filter? ` AND (status eq 'Reviewed')` : `(status eq 'Reviewed')`
            }
            console.log(filter);
            const transport = new NTLMSERVICE('applications');
            const bcInstance = new BCController(transport);
            for (const q in req?.query) {
                if (!q.startsWith('$')){
                    delete req.query[q];
                }
            }
            const { success, data:applications, error } = await bcInstance.getApplications(filter, req.query);
            if (success) {
                return res.ApiResponse.success(applications);
            }else {
                return res.ApiResponse.error(404, error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, error);
        }
    }
    async application(req, res) {
        try {
            if (!req.params.id) return res.ApiResponse.error(500, "Invalid application id");
            const transport = new NTLMSERVICE(`applications(${req.params.id})`);
            const bcInstance = new BCController(transport);
            const { success, data:application, error } = await bcInstance.getApplication();
            if (success) {
                return res.ApiResponse.success(application);
            }else {
                return res.ApiResponse.error(404, error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, error.message);
        }
    }
}
