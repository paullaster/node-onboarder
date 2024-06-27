import ProfessionalBody from "../../model/professionalbody.js";
import Biodata from "../../model/biodata.js";
import Address from "../../model/address.js";
import Attachment from "../../model/attachment.js";
import Education from "../../model/education.js";
import WorkExperience from "../../model/workexperience.js";
import { fileTypeFromBuffer } from "file-type";
import fs from  "fs";
export class ApplicationController {
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
            .then( async(response) => {
                await Address.create({applicantId: response['dataValues'].id, ...physicalAddress});
                await Education.create({applicantId: response['dataValues'].id, ...education});
                await ProfessionalBody.create({applicantId: response['dataValues'].id, ...professionalBodys});
                await WorkExperience.create({applicantId: response['dataValues'].id, ...workExperience});
                for (let prop in attachments) {
                    const attachmentObj = {
                        name: prop,
                        base64: attachments[prop],
                        id: response['dataValues'].id
                    };
                    await this.processImage(attachmentObj);
                }
                return res.ApiResponse.success({}, 201, "Application submitted successfully");
            });
        } catch (error) {
            return res.ApiResponse.error(500, "Error while submitting application", error);
        }
    }
    async processImage(attachment) {
        try {
            const attachmentBuffer = Buffer.from(attachment.base64, 'base64');
            const fileType = await fileTypeFromBuffer(attachmentBuffer);
            const fileName = `public/attachments/${attachment.name}-${attachment.id}.${fileType.ext}`;
            await this.storeAttachment(attachmentBuffer, fileName, fileType.mime);
            await Attachment.create({
                name: attachment.name,
                url: fileName,
                applicantId: attachment.id,
            });
        } catch (error) {
            return  error;
        }
    }
    async storeAttachment(attachment, fileName, format) {
        try {
            if (format === 'application/pdf') {
                fs.writeFile(fileName, attachment, (err, data) => {
                    if (err) throw err;
                    console.log('File saved!');
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
}