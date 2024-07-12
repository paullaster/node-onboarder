import eventEmmitter from "../emmitter/event.emitter.js";
import NTLMSERVICE from "../../services/ntlm.service.js";
import { BCController } from "../../controller/bc/bc.controller.js";
import Application from "../../model/application.js";

// APPLICATION SUBITTED
eventEmmitter.on("BCInsert", async(payload) => {
    const ntlmService = new NTLMSERVICE('biodata');
    const BCINSTANCE = new BCController(ntlmService);
    const { success } = await BCINSTANCE.postapplicant(payload.payload);
    if (success) {
        const updateApplication = await Application.findOne({ where: { applicantId: payload.applicantId } });
        if (updateApplication) {
            await updateApplication.update({ synced: true });
        }
    }
});