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
    constructor() {
        this.applicant = null;
        this.applicantId = null;
        this.application = this.application.bind(this);
        this.processAttachments = this.processAttachments.bind(this);
        this.storeAttachment = this.storeAttachment.bind(this);
        this.addEducation = this.addEducation.bind(this);
        this.addProfessionalBodys = this.addProfessionalBodys.bind(this);
        this.processWorkExperience = this.processWorkExperience.bind(this);
        this.processContact = this.processContact.bind(this);
        this.processAddress = this.processAddress.bind(this);
        this.processEssay = this.processEssay.bind(this);
        this.persistApplicantAttachments = this.persistApplicantAttachments.bind(this);
    }
    async applications (req, res) {
        try {
            Application.findAll({include: [{model:Biodata, include:{Address}}]})            
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
