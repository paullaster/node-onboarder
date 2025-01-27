
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
                const prop = req.user.role.toLowerCase() !== 'hr' ? 'category' : req.query.onboarding ? 'onboardingConsortia' : 'approvedByConsortia';
                if (!categoryFilterQuery) {
                    categoryFilterQuery = ` ${prop} eq '${category}'`;
                } else {
                    categoryFilterQuery += ` OR ${prop} eq '${category}'`;
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
            if (countyFilterQuery && (req.user.role.toLowerCase() !== 'hr' || countyFilterQuery && req.user.role.toLowerCase() !== 'admin')) {
                filter += `(${countyFilterQuery})`;
            }
            if (
                categoryFilterQuery && 
                (
                    req.user.role.toLowerCase() === 'hr' ||
                    req.user.role.toLowerCase() === 'admin'
                ) && 
                !req.query.approved && !req.query.onboarding && !req.query.hrReviewed) {
                filter = `(status eq 'New')`;
            }
            if (categoryFilterQuery && req.user.role.toLowerCase() !== 'hr' && req.user.role.toLowerCase() !== 'admin') {
                filter += filter ? ` AND (${categoryFilterQuery}) AND (status eq 'New')` : `(${categoryFilterQuery}) AND (status eq 'New')`;
            }
            if (req.query.onboarding) {
                if (req.user.role.toLowerCase() === 'hr') {
                    filter = categoryFilterQuery ? ` (${categoryFilterQuery}) AND (status eq 'Onboarded')` : ` (status eq 'Onboarded')`;
                }else if (req.user.role.toLowerCase() === 'admin') {
                    filter = `(status eq 'Onboarded')`;
                }else {
                    filter = `(onboardingConsortia eq '${req.user.belongsTo}') AND (status eq 'Onboarded')`;
                }
            }
            if (req.query.approved) {
                if (req.user.role.toLowerCase() == 'admin') {
                    filter = `(status eq 'Approved')`;
                }else if (req.user.role.toLowerCase() === 'hr'){
                    filter = categoryFilterQuery ? `(${categoryFilterQuery}) AND (status eq 'Approved')` : ` (status eq 'Approved')`;
                }else {
                    filter = `(onboardingConsortia eq '${req.user.belongsTo}') AND (status eq 'Approved')`
                }
            }
            if (req.query.hrReviewed ) {
                if (req.user.role.toLowerCase() === 'hr') {
                    filter = categoryFilterQuery ? ` (${categoryFilterQuery} )AND (status eq 'Reviewed') AND (hRReviewedBy eq '${req.user.consoltium}')` : `(status eq 'Reviewed') AND (hRReviewedBy eq '${req.user.consoltium}')`
                }else if (req.user.role.toLowerCase() === 'admin') {
                    filter = `(status eq 'Reviewed')`

                }else {
                    filter = ` (approvedByConsortia eq '${req.user.belongsTo}')  AND (status eq 'Reviewed')`;
                }
                
                
            }
            console.log(filter);
            const transport = new NTLMSERVICE('applications');
            const bcInstance = new BCController(transport);
            for (const q in req?.query) {
                if (!q.startsWith('$')) {
                    delete req.query[q];
                }
            }
            const { success, data: applications, error } = await bcInstance.getApplications(filter, req.query);
            if (success) {
                return res.ApiResponse.success(applications);
            } else {
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
            const { success, data: application, error } = await bcInstance.getApplication();
            if (success) {
                return res.ApiResponse.success(application);
            } else {
                return res.ApiResponse.error(404, error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, error.message);
        }
    }
    async searchApplications(req, res) {
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) return res.ApiResponse.error(401, "Unauthorized");
            if (!req.query) return res.ApiResponse.error(500, "Invalid search query");
            const categoriesFilter = user['dataValues'].categoriesFilter.split("|");
            const countiesFilter = user['dataValues'].countiesFilter.split("|");
            let categoryFilterQuery;
            let countiesFilterQuery;
            categoriesFilter.forEach((category) => {
                const prop = req.user.role.toLowerCase() !== 'hr' ? 'category' :
                    req.query.status === 'Onboarded' ? 'onboardingConsortia' : 'approvedByConsortia';
                if (!categoryFilterQuery) {
                    categoryFilterQuery = ` ${prop} eq '${category}'`;
                } else {
                    categoryFilterQuery += ` OR ${prop} eq '${category}'`;
                }
            })
            countiesFilter.forEach((county) => {
                if (!countiesFilterQuery) {
                    countiesFilterQuery = ` countyOfOrigin eq '${county}'`;
                } else {
                    countiesFilterQuery += ` OR countyOfOrigin eq '${county}'`;
                }
            })
            let filter;
            const paginator = {};
            for (const [key, value] of Object.entries(req.query)) {
                if (key.startsWith('$')) {
                    paginator[key] = value;
                    delete req.query[key];
                }
            }
            for (const [key, value] of Object.entries(req.query)) {
                if (!req.query[key]) return res.ApiResponse.error(500, "Invalid search query");
                switch (key) {
                    case 'county':
                        if (!filter) {
                            filter = `(countyOfOrigin eq '${value}')`;
                        } else {
                            filter += ` AND (countyOfOrigin eq '${value}')`;
                        }
                        if (req.user.role.toLowerCase() !== 'admin') {
                            if (categoryFilterQuery) {
                                filter += ` AND (${categoryFilterQuery})`;
                            }
                        }
                        break;
                    case 'category':
                        if (!filter) {
                            filter = `(category eq '${value}')`;
                        } else {
                            filter += ` AND (category eq '${value}')`;
                        }
                        if (req.user.role.toLowerCase() === 'hr') {
                            if (countiesFilterQuery) {
                                filter += ` AND (${categoryFilterQuery})`;
                            }
                        }
                        else if (
                            req.user.role.toLowerCase() !== 'admin' &&
                            req.user.role.toLowerCase() !== 'hr'
                        ) {
                            if (countiesFilterQuery) {
                                filter += ` AND (${countiesFilterQuery})`;
                            }
                        }
                        break;
                    case 'status':
                        switch (value) {
                            case 'New':
                                if (!filter) {
                                    filter = `(status eq 'New')`;
                                } else {
                                    filter += ` AND (status eq 'New')`;
                                }
                                break;
                            case 'Onboarded':
                                let tfilter;
                                if (
                                    req.user.role.toLowerCase() === 'hr' ||
                                    req.user.role.toLowerCase() === 'admin'
                                ) {
                                    tfilter = `(status eq 'Onboarded')`;
                                }else {
                                    tfilter = `(status eq 'Onboarded') AND (onboardingConsortia eq '${req.user.belongsTo}')`;
                                }
                                if (filter) {
                                    filter=filter + ' AND ' + tfilter;
                                }  else {
                                    filter=tfilter
                                }
                                break;
                            case 'Approved':
                                if (!filter) {
                                    if (
                                        req.user.role.toLowerCase() === 'hr' ||
                                        req.user.role.toLowerCase() === 'admin'
                                    ) {
                                        filter = `(status eq 'Approved')`;
                                    } else {
                                        filter = `(status eq 'Approved') AND (onboardingConsortia eq '${req.user.belongsTo}')`;
                                    }
                                } else {
                                    if (
                                        req.user.role.toLowerCase() === 'hr' ||
                                        req.user.role.toLowerCase() === 'admin'
                                    ) {
                                        filter += ` AND (status eq 'Approved')`;
                                    }else {
                                        filter += ` AND (status eq 'Approved') AND (onboardingConsortia eq '${req.user.belongsTo}')`;
                                    }
                                }
                                break;
                            case 'Reviewed':
                                if (!filter) {
                                    if (
                                        req.user.role.toLowerCase() === 'hr' ||
                                        req.user.role.toLowerCase() === 'admin'
                                ) {
                                    filter = `(status eq 'Reviewed')`;
                                    }else {
                                        filter = `(status eq 'Reviewed') AND (approvedByConsortia eq '${req.user.belongsTo}')`;
                                    }
                                } else {
                                    if (
                                        req.user.role.toLowerCase() === 'hr' ||
                                        req.user.role.toLowerCase() === 'admin'
                                ) {
                                    filter += ` AND (status eq 'Reviewed')`;
                                    }else {
                                        filter += ` AND (status eq 'Reviewed') AND (approvedByConsortia eq '${req.user.belongsTo}')`;
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                        if (!filter) {
                            filter = `(${key} eq '${value}')`;
                        } else {
                            filter += ` AND (${key} eq '${value}')`;
                        }
                        break;


                }

            }
            const transport = new NTLMSERVICE('applications');
            const bcInstance = new BCController(transport);
            console.log("FILTER QUERY: ", filter)
            const { success, data: applications, error } = await bcInstance.getApplications(filter, paginator);
            if (success) {
                return res.ApiResponse.success(applications);
            } else {
                return res.ApiResponse.error(404, error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, error);
        }
    }
    async navigateToNext(req, res) {
        try {
            if (!req.query) return res.ApiResponse.error(500, "Invalid next page token");
            const transport = new NTLMSERVICE(`applications?${req.query}`);
            const bcInstance = new BCController(transport);
            const { success, data: applications, error } = await bcInstance.navigateToNext();
            if (success) {
                return res.ApiResponse.success(applications);
            } else {
                return res.ApiResponse.error(404, error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, error.message);
        }
    }

}
