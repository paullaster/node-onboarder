export class HostelRequest {
    constructor(BCInterface) {
        this.BCInterface = BCInterface;
        this.createHostelRequest = this.createHostelRequest.bind(this);
        this.updateHostelRequest = this.updateHostelRequest.bind(this);
        // this.deleteHostelRequest = this.deleteHostelRequest.bind(this);
        this.getHostelRequests = this.getHostelRequests.bind(this);
        // this.getSingleHostelRequest = this.getSingleHostelRequest.bind(this);
    }
    async getHostelRequests(req, res) {
        try {
            const filter = {
                '$filter': `profileID eq '${req.user.consoltium}'`,
                '$expand': "*",
            };
            const headers = {
                "Prefer": "odata.maxpagesize=20",
                'Data-Access-Intent': 'ReadOnly',
            };
            const { success, data, error } = await this.BCInterface.bcRequest('get', {}, filter, headers);
            if (success) {
                return res.ApiResponse.success(data, 200, "Reset password link has been sent to your email.");;
            } else {
                return res.ApiResponse.error(500, "We encouterred an error:  " + error);
            }
        } catch (error) {
            return res.ApiResponse.error(500, "We encouterred an error:  " + error.message);
        }
    }
    async createHostelRequest(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Invalid payload");
            }
            req.body['profileID'] = req.user.consoltium;
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
    async updateHostelRequest (req, res) {
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