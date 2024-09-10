import { Router } from "express"
import { HostelRequest } from "../app/controller/hostelRequest/hostel.request.controller.js";
import { BCController } from "../app/controller/bc/bc.controller.js";
import NTLMSERVICE from "../app/services/ntlm.service.js";




const hostelRequestroute = Router();

hostelRequestroute.post('/biodata', new HostelRequest(new BCController(new NTLMSERVICE('hostelRequest'))).createHostelRequest);

export default hostelRequestroute;