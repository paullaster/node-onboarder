export class AccommodationInformation {
    constructor(BCInterface) {
        this.BCInterface = BCInterface;
        // this.deleteHostelRequest = this.deleteHostelRequest.bind(this);
        this.createAccommodationInformation = this.createAccommodationInformation.bind(this);
        this.updateAccommodationInformation = this.updateAccommodationInformation.bind(this);
        this.getAccommodationInformation = this.getAccommodationInformation.bind(this);
    }
    async getAccommodationInformation(req, res) {
        try {
            const headers = {
                "Content-Type": "application/json",
                'Data-Access-Intent': 'ReadOnly',
            };
            const { success, data, error } = await this.BCInterface.bcRequest('get', null, {}, headers);
            if (success) {
                return res.ApiResponse.success(data, 200, "Action was successful.");
            } else {
                return res.ApiResponse.error(500, "We encouterred an error:  " + error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, "We encouterred an error:  " + error.message);
        }
    }
    async createAccommodationInformation(req, res) {
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
    async updateAccommodationInformation(req, res) {
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