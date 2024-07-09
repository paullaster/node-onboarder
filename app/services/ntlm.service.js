
import bc from "../../config/bc.js";
import httpntlm from "httpntlm";
const { company, ...options } = bc;

class NTLMSERVICE {
    constructor(entity) {
        this.entity = entity;
        for (let prop in options) {
            this[prop] = options[prop];
        }
        this.request = this.request.bind(this);
    }
    async request(payload, method = 'GET') {
        try {
            const body = JSON.stringify(payload);
            console.log("body", body);
            const requestMethod = toUpperCase(method);
            const requestOptions = {
                url: `${this.url}/${this.entity}`,
                username: this.username,
                password: this.password,
                domain: this.domain,
                workstation: this.workstation,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            };
            console.log("options",requestOptions);
            switch (requestMethod) {
                case 'GET':
                    return {success: true, data: await httpntlm.get(requestOptions)};
                case 'POST':
                    return await httpntlm.post(requestOptions);
                case 'PUT':
                    return {success:true, data: await httpntlm.put({...requestOptions, headers: {
                        'If-Match': '*',
                        ...headers,
                    },})};
                case 'DELETE':
                    return {success: true, data: await httpntlm.del({...requestOptions, headers: {
                        'If-Match': '*',
                        ...headers,
                    },})};
                default:
                    return {success: false, error: "Invalid method"};
            }
        } catch (error) {
            return { success: false, error: error.message}
        }
    }
}

export default NTLMSERVICE;