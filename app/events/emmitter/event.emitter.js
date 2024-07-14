import { EventEmitter } from "events";
const eventEmmitter = new EventEmitter();

setInterval(() => {
    eventEmmitter.emit("syncBC");
}, 10800000);
export default eventEmmitter;