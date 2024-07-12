import ProfessionalBody from "../../model/professionalbody.js";
import Biodata from "../../model/biodata.js";
import Address from "../../model/address.js";
import Attachment from "../../model/attachment.js";
import Education from "../../model/education.js";
import WorkExperience from "../../model/workexperience.js";
import Application from "../../model/application.js";
import Essay from "../../model/essay.js";

export class ApplicationsController {
    async applications (req, res) {
        try {
            const { page, limit } = req.query;
            if (limit) {
                req.query.limit = Number(limit);
            }
            if (page) {
                req.query.offset = Number(page);
            }
            const applications = await Application.findAndCountAll({ limit: req.query.limit || 10, include: [{model:Biodata, include:[ProfessionalBody, Address, Education, WorkExperience, Essay, Attachment]}]});
            return res.ApiResponse.success(applications);   
        } catch (error) {
            return res.ApiResponse.error(500, error);
        }
    }
    async application (req, res) {
        try {
            if (!req.params.id) return res.ApiResponse.error(500, "Invalid application id");
            return res.ApiResponse.success(await Application.findOne({where: {id: req.params.id}, include: [{model:Biodata, include:[ProfessionalBody, Address, Education, WorkExperience, Essay, Attachment]}]}))           
        } catch (error) {
            return res.ApiResponse.error(500, error.message);
        }
    }    
}
