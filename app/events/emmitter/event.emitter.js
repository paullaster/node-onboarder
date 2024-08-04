import { EventEmitter } from "events";
const eventEmmitter = new EventEmitter();

setInterval(() => {
    eventEmmitter.emit("syncBC");
}, 300000);

setTimeout(() => {
    eventEmmitter.emit("unsync");
},5000)
export default eventEmmitter;