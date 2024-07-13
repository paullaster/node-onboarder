import ProfessionalBody from "../../model/professionalbody.js";
import Biodata from "../../model/biodata.js";
import Application from "../../model/application.js";
import Address from "../../model/address.js";
import Attachment from "../../model/attachment.js";
import Education from "../../model/education.js";
import WorkExperience from "../../model/workexperience.js";
import Essay from "../../model/essay.js";
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import eventEmmitter from "../../events/emmitter/event.emitter.js";
import { makeid } from "../../../util/random.string.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
export class ApplicationController {
    constructor() {
        this.applicant = null;
        this.applicantId = null;
        this.application = this.application.bind(this);
        this.processAttachments = this.processAttachments.bind(this);
        this.storeAttachment = this.storeAttachment.bind(this);
        this.addEducation = this.addEducation.bind(this);
        this.addProfessionalBodys = this.addProfessionalBodys.bind(this);
        this.processWorkExperience = this.processWorkExperience.bind(this);
        this.processAddress = this.processAddress.bind(this);
        this.processEssay = this.processEssay.bind(this);
        this.persistApplicantAttachments = this.persistApplicantAttachments.bind(this);
        this.persistApplication = this.persistApplication.bind(this);
        this.pushApplication = this.pushApplication.bind(this);
    }
    async application(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while submitting application",);
            }
            // VALIDATIONS
            const { success:ed, } = await validationMiddleware.education(req.body.education);
            
            if (!ed) {
                return res.ApiResponse.error(400, "Error while submitting application. Invalid education record.: ");
            }
            if (req.body.professionalBodys?.length) {
                const { success:org, } = await validationMiddleware.professionalBody(req.body.professionalBodys);
                
            if (!org) {
                return res.ApiResponse.error(400, "Error while submitting application. Invalid professional bodies record.: ");
            }
            }
            const {
                physicalAddress,
                education,
                professionalBodys,
                workExperience,
                attachments,
                essay,
                ...rest
            } = req.body;
            let dob = new Date(rest.dob);
            rest.dob = dob.toISOString().split('T')[0]
            Biodata.create(rest)
                .then(async (response) => {
                    this.applicantId = response['dataValues'].id;
                    this.applicant = response['dataValues'];
                    await this.processAddress(physicalAddress);
                    await this.addEducation(education);
                    await this.processEssay(essay);
                    professionalBodys.length && await this.addProfessionalBodys(professionalBodys);
                    response['dataValues'].currentlyEmployed && await this.processWorkExperience(workExperience);
                    const applicantAttachments = [];
                    for (let prop in attachments) {
                        const attachmentObj = {
                            name: prop,
                            base64: attachments[prop],
                            id: response['dataValues'].id
                        };
                        const attachmentObject = await this.processAttachments(attachmentObj);
                        applicantAttachments.push(attachmentObject);
                    }
                    await this.persistApplicantAttachments(applicantAttachments);
                    await this.persistApplication();
                    req.body.applicantAttachments = applicantAttachments;
                    req.body.applicantId = this.applicantId;
                    req.body.dob = rest.dob;
                    eventEmmitter.emit('BCInsert', req.body);
                    eventEmmitter.emit("applicationSubmitted", this.applicant);
                    return res.ApiResponse.success({}, 201, "Application submitted successfully");
                })
                .catch((error) => {
                    console.log("FAILED BIODATA BODY", rest);
                    console.log("BIODATA VALIDATION", error?.errors[0]?.message || error);
                    return res.ApiResponse.error(500, "Error while submitting application:  " + error.errors[0].message || error.message);
                });
        } catch (error) {
            return res.ApiResponse.error(500, "Error while submitting application " + error.message);
        }
    }
    async addEducation(arr) {
        try {
            const educationArray = arr.map((ed) => {
                return {
                    applicantId: this.applicantId,
                    ...ed
                };
            })
            return await Education.bulkCreate(educationArray);
        } catch (error) {
            return error;
        }
    }
    async addProfessionalBodys(arr) {
        try {
            const professionalBodysArray = arr.map((prb) => {
                return {
                    applicantId: this.applicantId,
                    ...prb
                };
            })
            return await ProfessionalBody.bulkCreate(professionalBodysArray);
        } catch (error) {
            return error;
        }
    }
    async processWorkExperience(workExperience) {
        try {
            return await WorkExperience.create({ applicantId: this.applicantId, ...workExperience });
        } catch (error) {
            return error;
        }
    }
    async processAddress(address) {
        try {
            return await Address.create({ applicantId: this.applicantId, ...address });
        } catch (error) {
            return error;
        }
    }
    async processEssay(essay) {
        try {
            return await Essay.create({ applicantId: this.applicantId, ...essay });
        } catch (error) {
            return error;
        }
    }
    async processAttachments(attachment) {
        try {
            const attachmentBuffer = Buffer.from(attachment.base64, 'base64');
            const fileType = await fileTypeFromBuffer(attachmentBuffer);
            const fileName = `public/attachments/${attachment.name}-${attachment.id}-${makeid(5)}.${fileType.ext}`;
            const attachmentObj = {
                name: attachment.name,
                url: fileName,
                applicantId: attachment.id,
            }
            await this.storeAttachment(attachmentBuffer, fileName, fileType.mime);
            return attachmentObj;

        } catch (error) {
            return error;
        }
    }
    async storeAttachment(attachment, fileName, format) {
        try {
            if (format === 'application/pdf') {
                fs.writeFile(fileName, attachment, (err, data) => {
                    if (err) throw err;
                });
            } else if (format === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                fs.writeFile(fileName, attachment);
            } else if (format === 'application/msword') {
                fs.writeFile(fileName, attachment);
            } else {
                return false;
            }

        } catch (error) {
            return false;
        }
    }
    async persistApplicantAttachments(attachments) {
        try {
            return await Attachment.bulkCreate(attachments);
        } catch (error) {
            return error;
        }
    }
    async persistApplication() {
        try {
            await Application.create({ applicantId: this.applicantId });
        } catch (error) {
            return error.message
        }
    }
    async pushApplication(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while submitting application",);
            }
            // VALIDATIONS
            const { success:ed, } = await validationMiddleware.education(req.body.education);
            
            if (!ed) {
                return res.ApiResponse.error(400, "Error while submitting application. Invalid education record.: ");
            }
            if (req.body.professionalBodys?.length) {
                const { success:org, } = await validationMiddleware.professionalBody(req.body.professionalBodys);
                
            if (!org) {
                return res.ApiResponse.error(400, "Error while submitting application. Invalid professional bodies record.: ");
            }
            }
            const {
                physicalAddress,
                education,
                professionalBodys,
                workExperience,
                attachments,
                essay,
                ...rest
            } = req.body;
            let dob = new Date(rest.dob);
            rest.dob = dob.toISOString().split('T')[0]
            Biodata.create(rest)
                .then(async (response) => {
                    this.applicantId = response['dataValues'].id;
                    this.applicant = response['dataValues'];
                    await this.processAddress(physicalAddress);
                    await this.addEducation(education);
                    await this.processEssay(essay);
                    professionalBodys.length && await this.addProfessionalBodys(professionalBodys);
                    response['dataValues'].currentlyEmployed && await this.processWorkExperience(workExperience);
                    const applicantAttachments = [];
                    for (let prop in attachments) {
                        const attachmentObj = {
                            name: prop,
                            url: attachments[prop],
                            applicantId: response['dataValues'].id
                        };
                        // const attachmentObject = await this.processAttachments(attachmentObj);
                        applicantAttachments.push(attachmentObj);
                    }
                    await this.persistApplicantAttachments(applicantAttachments);
                    await this.persistApplication();
                    req.body.applicantAttachments = applicantAttachments;
                    req.body.applicantId = this.applicantId;
                    req.body.dob = rest.dob;
                    eventEmmitter.emit('BCInsert', req.body);
                    eventEmmitter.emit("applicationSubmitted", this.applicant);
                    return res.ApiResponse.success({}, 201, "Application submitted successfully");
                })
                .catch((error) => {
                    console.log("FAILED BIODATA BODY", rest);
                    console.log("BIODATA VALIDATION", error?.errors[0]?.message || error);
                    return res.ApiResponse.error(500, "Error while submitting application:  " + error.errors[0].message || error.message);
                });
        } catch (error) {
            return res.ApiResponse.error(500, "Error while submitting application " + error.message);
        }
    }
}
