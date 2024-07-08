import ProfessionalBody from "../../model/professionalbody.js";
import Biodata from "../../model/biodata.js";
import Address from "../../model/address.js";
import Attachment from "../../model/attachment.js";
import Education from "../../model/education.js";
import WorkExperience from "../../model/workexperience.js";
import Contact from "../../model/contact.js";
import Application from "../../model/application.js";
import Essay from "../../model/essay.js";

export class ApplicationsController {
    async applications (req, res) {
        try {
            const applications = await Application.findAll( {include: [{model:Biodata, include:[ProfessionalBody, Address, Education, WorkExperience, Contact, Essay, Attachment]}]});
            return res.ApiResponse.success(applications);   
        } catch (error) {
            return res.ApiResponse.error(500, error);
        }
    }
    async application (req, res) {
        try {
            return res.ApiResponse(await Application.findOne({where: {applicationId: req.param.id},include: [{model:Biodata, include:{Address}}]}))           
        } catch (error) {
            return res.ApiResponse.error(500, error);
        }
    }    
}
