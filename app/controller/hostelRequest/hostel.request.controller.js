class HostelRequest {
    constructor(BCInterface) {
        this.BCInterface = BCInterface;
        this.createHostelRequest = this.createHostelRequest.bind(this);
        this.updateHostelRequest = this.updateHostelRequest.bind(this);
        this.deleteHostelRequest = this.deleteHostelRequest.bind(this);
        this.getHostelRequests = this.getHostelRequests.bind(this);
        this.getSingleHostelRequest = this.getSingleHostelRequest.bind(this);
    }
    async getHostelRequests(req, res) {
        try {
            const filter = {
                '$filter': `profileID eq '${req.user.consoltium}`,
            };
            const headers = {
                "Prefer": "return=representation, odata.maxpagesize=20",
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
}