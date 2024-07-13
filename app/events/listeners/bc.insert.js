import eventEmmitter from "../emmitter/event.emitter.js";
import NTLMSERVICE from "../../services/ntlm.service.js";
import { BCController } from "../../controller/bc/bc.controller.js";
import Application from "../../model/application.js";
import app from "../../../config/app.js";

// APPLICATION SUBITTED
eventEmmitter.on("BCInsert", async(payload) => {
    const ntlmService = new NTLMSERVICE('biodata');
    const BCINSTANCE = new BCController(ntlmService);

    const { attachments, professionalBodys, workExperience, essay, applicantId, applicantAttachments, middleName, email, phoneNumber, registeredProfessionalRegistrationNumber, physicalAddress, ...data } = payload;
    const body = {
        ...data,
        registeredProfessionalNumber: payload.registeredProfessionalRegistrationNumber,
        secondName: payload.middleName,
        category: payload.profession === 'OTHERS' ? 'OTHERS' : payload.profession,
        ...physicalAddress,
        eMail: payload.email,
        phone: payload.phoneNumber,
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
    }else {
        console.error(`Error in BC Insert: ${error}`);
    }
});