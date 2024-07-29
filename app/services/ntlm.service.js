
import bc from "../../config/bc.js";
import { NtlmClient } from "axios-ntlm";
const { company, username, password, domain, url, odata_url } = bc;

class NTLMSERVICE {
    constructor(entity, odata = false, provider = null, company = null ) {
        this.entity = entity;
        this.credentials = {
            username: username,
            password: password,
            domain: domain
        }
        this.odata = odata;
        this.url = `${url}/${this.entity}`;
        this.odata_url = `${odata_url}/${this.entity}`
        this.request = this.request.bind(this);
    }
    async request(payload = {}, method = 'GET', params = {}) {
        try {
            const requestMethod = method.toUpperCase();
            if (this.odata) {
                this.url = this.odata_url;
            }
            const requestOptions = {
                url: this.url,
                method: requestMethod,
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            if (Object.keys(params).length) {
                requestOptions.params = params;
            }
            switch (requestMethod) {
                case 'GET':
                    break;
                case 'DELETE':
                    requestOptions.headers['If-Match'] = "*"; 
                    break;
                case 'POST':
                    if (Object.keys(payload).length) {
                        requestOptions.data = payload;
                    }
                    break;
                case 'PUT':
                    requestOptions.headers['If-Match'] = "*"; 
                    if (Object.keys(payload).length) {
                        requestOptions.data = payload;
                    }
                    break;
                default:
                    return { success: false, error: 'Unsupported method' };
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