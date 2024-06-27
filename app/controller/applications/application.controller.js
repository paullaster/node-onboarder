import ProfessionalBody from "../../model/professionalbody";
import Biodata from "../../model/biodata";
import Address from "../../model/address";
import Attachment from "../../model/attachment";
import Education from "../../model/education";
import WorkExperience from "../../model/workexperience";
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
class ApplicationController {
    constructor() {
        this.application = this.application.bind(this);
        this.processImage = this.processImage.bind(this);
        this.storeAttachment = this.storeAttachment.bind(this);
    }
    async application (req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Error while submitting application",);
            }
            const {
                physicalAddress,
                education,
                professionalBodys,
                workExperience,
                attachments,
                ...rest
            } = req.body;
            Biodata.create(rest)
            .then( async(res) => {
                await Address.create({applicantId: res['dataValues'].id, ...physicalAddress});
                await Education.create({applicantId: res['dataValues'].id, ...education});
                await ProfessionalBody.create({applicantId: res['dataValues'].id, ...professionalBodys});
                await WorkExperience.create({applicantId: res['dataValues'].id, ...workExperience});
                for (let prop in attachments) {
                    const attachmentObj = {
                        name: prop,
                        base64: attachments[prop],
                        id: res['dataValues'].id
                    };
                    await this.processImage(attachmentObj);
                }
            });

            return res.ApiResponse.success(data, 201, "Application submitted successfully");
        } catch (error) {
            return res.ApiResponse.error(500, "Error while submitting application", error);
        }
    }
    async processImage(attachment) {
        try {
            const attachmentBuffer = Buffer.from(attachment.base64, 'base64');
            const fileType = await fileTypeFromBuffer(attachmentBuffer);
            const fileName = `/public/attachments/${attachment.name}-${attachment.id}.${fileType.ext}`;
            await this.storeAttachment(attachmentBuffer, fileName, fileType.mime);
        } catch (error) {
            throw new Error(error.message);
        }
    }
    async storeAttachment(attachment, fileName, format) {
        try {
            if (format === 'application/pdf') {
                fs.writeSync(fileName, attachment);
              } else if (format === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                fs.writeSync(fileName, attachment);
              } else if (format === 'application/msword') {
                fs.writeSync(fileName, attachment);
              } else {
                console.warn('Unsupported document format');
              }
        } catch (error) {
            return false;
        }
    }
}