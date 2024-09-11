import { Router } from "express"
import { HostelRequest } from "../app/controller/hostelRequest/hostel.request.controller.js";
import { BCController } from "../app/controller/bc/bc.controller.js";
import NTLMSERVICE from "../app/services/ntlm.service.js";
import { ContactPerson } from "../app/controller/hostelRequest/contact.person.controller.js";
import { StudentData } from "../app/controller/hostelRequest/student.data.controller.js";
import { AccommodationInformation } from "../app/controller/hostelRequest/accommodation.information.controller.js";




const hostelRequestroute = Router();

hostelRequestroute.post('/', new HostelRequest(new BCController(new NTLMSERVICE('hostelRequest'))).createHostelRequest);
hostelRequestroute.get('/', new HostelRequest(new BCController(new NTLMSERVICE('hostelRequest'))).getHostelRequests);
hostelRequestroute.patch('/', new HostelRequest(new BCController(new NTLMSERVICE('hostelRequest'))).updateHostelRequest);

// CONTACT
hostelRequestroute.post('/contact', new ContactPerson(new BCController(new NTLMSERVICE('contacts'))).createContactPerson);
hostelRequestroute.patch('/contact', new ContactPerson(new BCController(new NTLMSERVICE('contacts'))).updateContactPerson);

// STUDENT
hostelRequestroute.post('/student', new StudentData(new BCController(new NTLMSERVICE('studentData'))).createStudentData);
hostelRequestroute.get('/student', new StudentData(new BCController(new NTLMSERVICE('studentData'))).getStudentData);
hostelRequestroute.patch('/student', new StudentData(new BCController(new NTLMSERVICE('studentData'))).updateStudentData);


// ACCOMMODATION
hostelRequestroute.post('/accommodation', new AccommodationInformation(new BCController(new NTLMSERVICE('accomodationUnits'))).createAccommodationInformation);
hostelRequestroute.get('/accommodation', new AccommodationInformation(new BCController(new NTLMSERVICE('accomodationUnits'))).getAccommodationInformation);
hostelRequestroute.patch('/accommodation', new AccommodationInformation(new BCController(new NTLMSERVICE('accomodationUnits'))).updateAccommodationInformation);
hostelRequestroute.delete('/accommodation', new AccommodationInformation(new BCController(new NTLMSERVICE('accomodationUnits'))).createAccommodationInformation);




export default hostelRequestroute;