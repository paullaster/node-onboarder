import { Router } from "express"
import { HostelRequest } from "../app/controller/hostelRequest/hostel.request.controller.js";
import { BCController } from "../app/controller/bc/bc.controller.js";
import NTLMSERVICE from "../app/services/ntlm.service.js";
import { ContactPerson } from "../app/controller/hostelRequest/contact.person.controller.js";
import { StudentData } from "../app/controller/hostelRequest/student.data.controller.js";




const hostelRequestroute = Router();

hostelRequestroute.post('/', new HostelRequest(new BCController(new NTLMSERVICE('hostelRequest'))).createHostelRequest);
hostelRequestroute.get('/', new HostelRequest(new BCController(new NTLMSERVICE('hostelRequest'))).getHostelRequests);
hostelRequestroute.patch('/', new HostelRequest(new BCController(new NTLMSERVICE('hostelRequest'))).updateHostelRequest);

// CONTACT
hostelRequestroute.post('/contact', new ContactPerson(new BCController(new NTLMSERVICE('contacts'))).createContactPerson);
hostelRequestroute.patch('/contact', new ContactPerson(new BCController(new NTLMSERVICE('contacts'))).updateContactPerson);

// STUDENT
hostelRequestroute.post('/student', new StudentData(new BCController(new NTLMSERVICE('studentData'))).createStudentData);
hostelRequestroute.patch('/student', new StudentData(new BCController(new NTLMSERVICE('studentData'))).updateStudentData);

export default hostelRequestroute;