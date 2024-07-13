import { EventEmitter } from "events";
const eventEmmitter = new EventEmitter();

setInterval(() => {
    eventEmmitter.emit("syncBC");
}, 120000);
export default eventEmmitter;