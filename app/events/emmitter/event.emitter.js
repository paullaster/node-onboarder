import { EventEmitter } from "events";
const eventEmmitter = new EventEmitter();

// setInterval(() => {
//     eventEmmitter.emit("syncBC");
// }, 1000);

// setTimeout(() => {
//     // eventEmmitter.emit("unsync");
//     eventEmmitter.emit("recover-attachments");

// },3600000)
export default eventEmmitter;