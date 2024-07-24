import ProfessionalBody from "../../model/professionalbody.js";
import Biodata from "../../model/biodata.js";
import Address from "../../model/address.js";
import Attachment from "../../model/attachment.js";
import Education from "../../model/education.js";
import WorkExperience from "../../model/workexperience.js";
import Application from "../../model/application.js";
import Essay from "../../model/essay.js";
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
            if (categoryFilterQuery) {
                filter += filter? ` AND (${categoryFilterQuery})` : `(${categoryFilterQuery})`;
            }
            const transport = new NTLMSERVICE('applications');
            const bcInstance = new BCController(transport);
            const { success, data:applications, error } = await bcInstance.getApplications(filter);
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
