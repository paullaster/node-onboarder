// helpers/filterHelper.js
const buildCategoryFilterQuery = (categoriesFilter, role, query) => {
    let categoryFilterQuery = '';
    categoriesFilter.forEach((category) => {
        const prop = role.toLowerCase() !== 'hr' ? 'category' : query.onboarding ? 'onboardingConsortia' : 'approvedByConsortia';
        if (!categoryFilterQuery) {
            categoryFilterQuery = ` ${prop} eq '${category}'`;
        } else {
            categoryFilterQuery += ` OR ${prop} eq '${category}'`;
        }
    });
    return categoryFilterQuery;
};

const buildCountyFilterQuery = (countiesFilter) => {
    let countyFilterQuery = '';
    countiesFilter.forEach((county) => {
        if (!countyFilterQuery) {
            countyFilterQuery = `countyOfOrigin eq '${county}'`;
        } else {
            countyFilterQuery += ` OR countyOfOrigin eq '${county}'`;
        }
    });
    return countyFilterQuery;
};

const buildFilterQuery = (role, query, categoryFilterQuery, countyFilterQuery, belongsTo, consortium) => {
    let filter = '';
    const roleLower = role.toLowerCase();

    if (countyFilterQuery && (roleLower !== 'hr' || countyFilterQuery && roleLower !== 'admin')) {
        filter += `(${countyFilterQuery})`;
    }

    if (categoryFilterQuery && (roleLower === 'hr' || roleLower === 'admin') &&
        !query.approved && !query.onboarding && !query.hrReviewed) {
        filter = `(status eq 'New')`;
    }

    if (categoryFilterQuery && roleLower !== 'hr' && roleLower !== 'admin') {
        filter += filter ? ` AND (${categoryFilterQuery}) AND (status eq 'New')` : `(${categoryFilterQuery}) AND (status eq 'New')`;
    }

    if (query.onboarding) {
        if (roleLower === 'hr') {
            filter = categoryFilterQuery ? `(${categoryFilterQuery}) AND (status eq 'Onboarded')` : `(status eq 'Onboarded')`;
        } else if (roleLower === 'admin') {
            filter = `(status eq 'Onboarded')`;
        } else {
            filter = `(onboardingConsortia eq '${belongsTo}') AND (status eq 'Onboarded')`;
        }
    }

    if (query.approved) {
        if (roleLower === 'admin') {
            filter = `(status eq 'Approved')`;
        } else if (roleLower === 'hr') {
            filter = categoryFilterQuery ? `(${categoryFilterQuery}) AND (status eq 'Approved')` : `(status eq 'Approved')`;
        } else {
            filter = `(onboardingConsortia eq '${belongsTo}') AND (status eq 'Approved')`;
        }
    }

    if (query.hrReviewed) {
        if (roleLower === 'hr') {
            filter = categoryFilterQuery ? `(${categoryFilterQuery}) AND (status eq 'Reviewed') AND (hRReviewedBy eq '${consortium}')` : `(status eq 'Reviewed') AND (hRReviewedBy eq '${consortium}')`;
        } else if (roleLower === 'admin') {
            filter = `(status eq 'Reviewed')`;
        } else {
            filter = `(approvedByConsortia eq '${belongsTo}') AND (status eq 'Reviewed')`;
        }
    }

    return filter;
};

module.exports = {
    buildCategoryFilterQuery,
    buildCountyFilterQuery,
    buildFilterQuery
};


// controllers/applicationController.js
const { User } = require('../models');
const NTLMSERVICE = require('../services/NTLMSERVICE');
const BCController = require('../controllers/BCController');
const { buildCategoryFilterQuery, buildCountyFilterQuery, buildFilterQuery } = require('../helpers/filterHelper');

const applications = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.ApiResponse.error(401, "Unauthorized");

        const categoriesFilter = user.dataValues.categoriesFilter.split("|");
        const countiesFilter = user.dataValues.countiesFilter.split("|");

        const categoryFilterQuery = buildCategoryFilterQuery(categoriesFilter, req.user.role, req.query);
        const countyFilterQuery = buildCountyFilterQuery(countiesFilter);
        const filter = buildFilterQuery(req.user.role, req.query, categoryFilterQuery, countyFilterQuery, req.user.belongsTo, req.user.consortium);

        console.log(filter);
        const transport = new NTLMSERVICE('applications');
        const bcInstance = new BCController(transport);

        for (const q in req.query) {
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
};

module.exports = {
    applications
};
