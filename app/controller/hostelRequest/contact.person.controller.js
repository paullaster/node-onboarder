export class ContactPerson {
    constructor(BCInterface) {
        this.BCInterface = BCInterface;
        // this.deleteHostelRequest = this.deleteHostelRequest.bind(this);
        this.createContactPerson = this.createContactPerson.bind(this);
        this.updateContactPerson = this.updateContactPerson.bind(this);
    }
    async createContactPerson(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Invalid payload");
            }
            const headers = {
                "Content-Type": "application/json",
                'Data-Access-Intent': 'ReadWrite',
            };
            const { success, data, error } = await this.BCInterface.bcRequest('post', req.body, {}, headers);
            if (success) {
                return res.ApiResponse.success(data, 201, "Action was successful.");
            } else {
                return res.ApiResponse.error(500, "We encouterred an error:  " + error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, "We encouterred an error:  " + error.message);
        }
    }
    async updateContactPerson(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Invalid payload");
            }
            const headers = {
                "Content-Type": "application/json",
                'Data-Access-Intent': 'ReadWrite',
            };
            const { success, data, error } = await this.BCInterface.bcRequest('patch', req.body, {}, headers);
            if (success) {
                return res.ApiResponse.success(data, 200, "Action was successful.");
            } else {
                return res.ApiResponse.error(500, "We encouterred an error:  " + error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, "We encouterred an error:  " + error.message);
        }
    }
}