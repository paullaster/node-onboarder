import eventEmmitter from "../emmitter/event.emitter.js";
import NTLMSERVICE from "../../services/ntlm.service.js";
import { BCController } from "../../controller/bc/bc.controller.js";
import Application from "../../model/application.js";
import app from "../../../config/app.js";
import Biodata from "../../model/biodata.js";
import Address from "../../model/address.js";
import ProfessionalBody from "../../model/professionalbody.js";
import Education from "../../model/education.js";
import Attachment from "../../model/attachment.js";
import WorkExperience from "../../model/workexperience.js";
import Essay from "../../model/essay.js";

// APPLICATION SUBITTED
eventEmmitter.on("BCInsert", async (payload) => {
    const ntlmService = new NTLMSERVICE('biodata');
    const BCINSTANCE = new BCController(ntlmService);

    const { attachments, professionalBodys, workExperience, essay, applicantId, applicantAttachments, middleName, email, phoneNumber, registeredProfessionalRegistrationNumber, physicalAddress, ...data } = payload;
    const body = {
        ...data,
        registeredProfessionalNumber: payload.registeredProfessionalRegistrationNumber,
        secondName: payload.middleName,
        ...physicalAddress,
        eMail: payload.email,
        phone: payload.phoneNumber,
        essay: essay.content,
        education: payload.education.map(ed => {
            return {
                institution: ed.institution,
                startDate: `${ed.yearOfStart}-01-01`,
                endDate: `${ed.yearOfGraduation}-12-31`,
                graduationDate: `${ed.yearOfGraduation}-12-31`,
                qualificationDescription: ed.degree,
                level: ed.educationLevel,
            }
        }),
        applicationAttachments: applicantAttachments.map(attachment => ({ name: attachment.name, link: `${app.url}/${attachment.url}` })),
    };
    if (payload.currentlyEmployed) {
        body.experience = [
            {
                nameOfFirm: payload.workExperience.companyName,
                positionHeld: payload.workExperience.jobTitle,
                responsibilitiesDescription: payload.workExperience.jobDescription,
                current: payload.currentlyEmployed
            }
        ];
    }
    if (payload.professionalBodys.length) {
        body.professionalBody = payload.professionalBodys;
    }

    const { success, error } = await BCINSTANCE.postapplicant(body);
    if (success) {
        const updateApplication = await Application.findOne({ where: { applicantId: applicantId } });
        if (updateApplication) {
            await updateApplication.update({ synced: true });
        }
    } else {
        console.error(`Error in BC Insert: ${error}`);
    }
});

eventEmmitter.on("syncBC", async () => {
    try {
        const ntlmService = new NTLMSERVICE('biodata');
        const BCINSTANCE = new BCController(ntlmService);
        // Get APPLICANT
        const application = await Application.findAll({
            where: { synced: false },
            attributes: ['applicantId'],
            include: [{ model: Biodata, include: [Address, ProfessionalBody, Education, Attachment, WorkExperience, Essay] }]
        });
        application.forEach(async(appl) => {
            const biodata = appl['dataValues'].Biodatum['dataValues'];
            let dob = new Date(biodata.dob);
            biodata.dob = dob.toISOString().split('T')[0]
            const {
                createdAt,
                updatedAt,
                id,
                registeredProfessionalRegistrationNumber,
                phoneNumber,
                email,
                middleName,
                Address,
                ProfessionalBodies,
                Education,
                WorkExperience,
                Essay,
                Attachments,
                ...rest
            } = biodata;
            const bcPayload = {
                ...rest,
                registeredProfessionalNumber: registeredProfessionalRegistrationNumber,
                secondName: middleName,
                eMail: email,
                phone: phoneNumber,
                category: biodata.profession,
                essay: Essay['dataValues'].content,
                education: Education.map(ed => {
                    ed = ed['dataValues'];
                    return {
                        institution: ed.institution,
                        startDate: `${ed.yearOfStart}-01-01`,
                        endDate: `${ed.yearOfGraduation}-12-31`,
                        graduationDate: `${ed.yearOfGraduation}-12-31`,
                        qualificationDescription: ed.degree,
                        level: ed.educationLevel,
                    }
                }),
                applicationAttachments: Attachments.map(attachment => {
                    attachment = attachment['dataValues'];
                    return { name: attachment.name, link: `${app.url}/${attachment.url}` }
                }),
            };
            if (biodata.currentlyEmployed) {
                const workExperience = WorkExperience['dataValues'];
                bcPayload.experience = [
                    {
                        nameOfFirm: workExperience.companyName,
                        positionHeld: workExperience.jobTitle,
                        responsibilitiesDescription: workExperience.jobDescription,
                        current: biodata.currentlyEmployed
                    }
                ];
            }
            if (ProfessionalBodies.length) {
                bcPayload.professionalBody = ProfessionalBodies.map((body) => {
                    const bdy = body['dataValues'];
                    return {
                        bodyName: bdy.bodyName,
                        membershipNumber: bdy.membershipNumber,
                        membershipType: bdy.membershipType
                    }
                });
            }
            const { success, error } = await BCINSTANCE.postapplicant(bcPayload);
            if (success) {
                const updateApplication = await Application.findOne({ where: { applicantId: appl['dataValues'].applicantId } });
                if (updateApplication) {
                    await updateApplication.update({ synced: true });
                }
            } else {
                console.error(`Error in BC Insert: ${error}`);
            }
        })
    } catch (error) {
        console.error(`Error in BC Insert: ${error}`);
    }
});