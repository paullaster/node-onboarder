
import bc from "../../config/bc.js";
import { NtlmClient } from "axios-ntlm";
const { company, username, password, domain, url } = bc;

class NTLMSERVICE {
    constructor(entity) {
        this.entity = entity;
        this.credentials = {
            username: username,
            password: password,
            domain: domain
        }
        this.url = `${url}/${this.entity}`;
        this.request = this.request.bind(this);
    }
    async request(payload = {}, method = 'GET') {
        try {
            const requestMethod = method.toUpperCase();
            const requestOptions = {
                url: this.url,
                method: requestMethod,
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            if (Object.keys(payload).length) {
                requestOptions.data = payload;
            }
            let client = NtlmClient(this.credentials)
            try {
                let resp = await client(requestOptions);
                return {success: true, data: resp.data}
            }
            catch (err) {
                if (Object.keys(payload).length) {
                    console.log("FAILED BC BODY", payload);
                }
                return {success: false, error: err.message}
            }
        } catch (error) {
            if (Object.keys(payload).length) {
                console.log("FAILED BC BODY", payload);
            }
            return { success: false, error: error.message }
        }
    }
}

export default NTLMSERVICE;