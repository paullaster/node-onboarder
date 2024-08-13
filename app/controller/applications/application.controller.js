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
import NTLMSERVICE from "../../services/ntlm.service.js";
import { BCController } from "../bc/bc.controller.js";
import { Op } from "sequelize";
import RecoveredAttachment from "../../model/attachmentRecoveryTrail.js";
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
        this.acceptApplication = this.acceptApplication.bind(this);
        this.peerReviewApplication = this.peerReviewApplication.bind(this);
        this.acceptBatchApplications = this.acceptBatchApplications.bind(this);
        this.batchPeerReviewApplications = this.batchPeerReviewApplications.bind(this);
        this.reverseOnboardedApplication = this.reverseOnboardedApplication.bind(this);
        this.batchReverseOnboardedApplications = this.batchReverseOnboardedApplications.bind(this);
        this.uploadAttachments = this.uploadAttachments.bind(this);
    }
    async application(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while submitting application",);
            }
            if (!req.body.category) {
                const categories_map =
                    [
                        "STRUCTURAL ENGINEERI",
                        "ARCHITECTURE",
                        "QUANTITY SURVEYING",
                        "CONSTRUCTION MAN.",
                        "CIVIL ENGINEERING",
                        "MECHANICAL ENG.",
                        "ELECTRICAL ENG.",
                        "LAND SURVEYORS",
                        "GEOINFORMATICS",
                        "LANDSCAPE ARCH.",
                        "INTERIOR DESIGN",
                        "SOCIAL DEVELOPMENT",
                        "URBAN & REG. PLANNIN",
                        "ENVIRONMENTAL SCI.",
                        "HEALTH AND SAFETY",
                        "COMM & BRANDING",
                        "ICT",
                    ];
                if (!categories_map.includes(req.body.profession)) {
                    req.body.category = "OTHERS";
                } else {
                    req.body.category = req.body.profession;
                }
            }
            // VALIDATIONS
            const { success: ed, } = await validationMiddleware.education(req.body.education);

            if (!ed) {
                return res.ApiResponse.error(400, "Error while submitting application. Invalid education record.: ");
            }
            if (req.body.professionalBodys?.length) {
                const { success: org, } = await validationMiddleware.professionalBody(req.body.professionalBodys);

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
                category,
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
                .catch(async (error) => {
                    console.log("FAILED BIODATA BODY", rest);
                    console.log("BIODATA VALIDATION", error?.errors[0]?.message || error);
                    if (error?.errors[0]?.message.includes("Biodata.phoneNumber cannot be null")) {
                        req.body.phoneNumber = req.body.contact.phoneNumber;
                        req.body.email = req.body.contact.email;
                        delete req.body.contact;
                        const newRequest = {
                            ...req
                        };
                        const newResponse = {
                            ...res,
                        }
                        return await this.application(newRequest, newResponse);
                    }
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
            fs.writeFile(fileName, attachment, (err, data) => {
                if (err) throw err;
            });

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
            const { success: ed, } = await validationMiddleware.education(req.body.education);

            if (!ed) {
                return res.ApiResponse.error(400, "Error while submitting application. Invalid education record.: ");
            }
            if (req.body.professionalBodys?.length) {
                const { success: org, } = await validationMiddleware.professionalBody(req.body.professionalBodys);

                if (!org) {
                    req.body.professionalBodys = [];
                }
            }
            const {
                physicalAddress,
                education,
                professionalBodys,
                workExperience,
                attachments,
                essay,
                category,
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
    async acceptApplication(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while accepting application",);
            }
            const bcPayload = {
                ...req.body,
                consortia: req.user.consoltium
            };
            const params = {
                company: 'CRONUS International Ltd.',
            };
            const transport = new NTLMSERVICE('AHPRecruitmentManager_OnboardApplication', true);
            const bcInstance = new BCController(transport);
            const { success, data: application, error } = await bcInstance.OnboardApplication(bcPayload, params);
            if (success) {
                return res.ApiResponse.success(application, 200, "Application accepted successfully");
            } else {
                return res.ApiResponse.error(514, "Error while accepting application:  " + error);
            }
        } catch (error) {
            console.log(error);
            return res.ApiResponse.error(500, "Error while accepting application: " + error.message);
        }
    }
    async acceptBatchApplications(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while accepting batch applications",);
            }

            const params = {
                company: 'CRONUS International Ltd.',
            };
            if (!Array.isArray(req.body)) {
                return res.ApiResponse.error(400, "Expected array payload!");
            }
            const transport = new NTLMSERVICE('AHPRecruitmentManager_OnboardApplication', true);
            const bcInstance = new BCController(transport);
            const len = req.body?.length;
            const consortia = req.user.consoltium;
            req.body.forEach(async (app, index) => {
                const payload = {
                    no: app,
                    consortia,
                };
                if (len - index === 1) {
                    const { success, data: applications, error } = await bcInstance.OnboardApplication(payload, params);
                    if (success) {
                        return res.ApiResponse.success(applications, 200, "Applications accepted successfully");
                    } else {
                        return res.ApiResponse.error(500, "Error while accepting", error);
                    }
                }
                await bcInstance.OnboardApplication(payload, params);
            });
        } catch (error) {
            return res.ApiResponse.error(500, "Error while accepting batch applications: " + error.message);
        }
    }
    async peerReviewApplication(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while reviewing this application",);
            }
            const bcPayload = {
                ...req.body,
                consortia: req.user.consoltium
            };
            const params = {
                company: 'CRONUS International Ltd.',
            };
            const transport = new NTLMSERVICE('AHPRecruitmentManager_PeerReviewApplication', true);
            const bcInstance = new BCController(transport);
            const { success, data: application, error } = await bcInstance.OnboardApplication(bcPayload, params);
            if (success) {
                return res.ApiResponse.success(application, 200, "Peer review was successful");
            } else {
                return res.ApiResponse.error(514, "Error while reviewing application:  " + error);
            }
        } catch (error) {
            console.log(error);
            return res.ApiResponse.error(500, "Error while reviewing application: " + error.message);
        }
    }
    async batchPeerReviewApplications(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while reviewing batch applications",);
            }

            const params = {
                company: 'CRONUS International Ltd.',
            };
            if (!Array.isArray(req.body)) {
                return res.ApiResponse.error(400, "Expected array payload!");
            }
            const transport = new NTLMSERVICE('AHPRecruitmentManager_PeerReviewApplication', true);
            const bcInstance = new BCController(transport);
            const len = req.body?.length;
            const consortia = req.user.consoltium;
            req.body.forEach(async (app, index) => {
                const payload = {
                    no: app,
                    consortia,
                };
                if (len - index === 1) {
                    const { success, data: applications, error } = await bcInstance.OnboardApplication(payload, params);
                    if (success) {
                        return res.ApiResponse.success(applications, 200, "Applications peer reviewed successfully");
                    } else {
                        return res.ApiResponse.error(500, "Error while reviewing", error);
                    }
                }
                await bcInstance.OnboardApplication(payload, params);
            });
        } catch (error) {
            return res.ApiResponse.error(500, "Error while reviewing batch applications: " + error.message);
        }
    }

    async reverseOnboardedApplication(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while reversing this application",);
            }
            const bcPayload = {
                ...req.body,
                consortia: req.user.consoltium
            };
            const params = {
                company: 'CRONUS International Ltd.',
            };
            const transport = new NTLMSERVICE('AHPRecruitmentManager_ReopenOnboardedApplication', true);
            const bcInstance = new BCController(transport);
            const { success, data: application, error } = await bcInstance.OnboardApplication(bcPayload, params);
            if (success) {
                return res.ApiResponse.success(application, 200, "Application reversed successfully");
            } else {
                return res.ApiResponse.error(514, "Error while reversing application:  " + error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, "Error while reversing this application: " + error.message);
        }
    }
    async batchReverseOnboardedApplications(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while reversing batch applications",);
            }

            const params = {
                company: 'CRONUS International Ltd.',
            };
            if (!Array.isArray(req.body)) {
                return res.ApiResponse.error(400, "Expected array payload!");
            }
            const transport = new NTLMSERVICE('AHPRecruitmentManager_ReopenOnboardedApplication', true);
            const bcInstance = new BCController(transport);
            const len = req.body?.length;
            const consortia = req.user.consoltium;
            req.body.forEach(async (app, index) => {
                const payload = {
                    no: app,
                    consortia,
                };
                if (len - index === 1) {
                    const { success, data: applications, error } = await bcInstance.OnboardApplication(payload, params);
                    if (success) {
                        return res.ApiResponse.success(applications, 200, "Applications were reversed successfully");
                    } else {
                        return res.ApiResponse.error(500, "Error while reversing", error);
                    }
                }
                await bcInstance.OnboardApplication(payload, params);
            });
        } catch (error) {
            return res.ApiResponse.error(500, "Error while reversing batch applications: " + error.message);
        }
    }
    async uploadAttachments(req, res) {
        try {
            // if(req.headers['origin'] !== 'https://ahpjobs.info/') {
            //     console.log(req.headers['origin']);
            //     return res.ApiResponse.error(403, "Forbidden");
            // }
            if (!req.body.user) {
                return res.ApiResponse.error(400, "Invalid user");
            }
            const getAttachments = await Attachment.findAll({ where: { applicantId: req.body.user, url: { [Op.like]: '%.doc%' } } });
            if (!getAttachments.length) {
                return res.ApiResponse.error(404, "No attachments to be updated for this user");
            }
            for (const attachment of getAttachments) {
                fs.writeFile(attachment['dataValues']['url'], req.files[attachment['dataValues']['name']][0]['buffer'], (err, data) => {
                    if (err) throw err;
                });
            }
            await RecoveredAttachment.create({ applicantId: req.body.user });
            return res.ApiResponse.success({}, 200, "We were able to update your application attachments successfully.");
        } catch (error) {
            return res.ApiResponse.error(500, "Error while reviewing batch applications: " + error.message);
        }
    }

}
