export class BCController {
    constructor(traport) {
        this.traport = traport;
        this.postapplicant = this.postapplicant.bind(this);
        this.getSetups = this.getSetups.bind(this);
        this.OnboardApplication = this.OnboardApplication.bind(this);
        this.getConsoltium = this.getConsoltium.bind(this);
        this.leaveFeedback = this.leaveFeedback.bind(this);
        this.getFeedbackHistory = this.getFeedbackHistory.bind(this);
        this.navigateToNext = this.navigateToNext.bind(this);
    }

    async postapplicant(applicant) {
        try {
            const { success, data, error } = await this.traport.request(applicant, 'POST');
            if (success) {
                return { success, data };
            }
            return {success, error };
        } catch (error) {
            return {success: false, error: error.message}
        }
    }

    async getSetups(req, res) {
        try {
            console.log(req.query)
            const data = await this.traport.request({}, 'GET', req.query);
            return res.ApiResponse.success(data, 200, );
        } catch (error) {
            return res.ApiResponse.error(error.message);
        }
    }

    async getApplications(filters, ...args) {
        try {
            let query = {
                "$filter": filters,
                "$expand": "*",
                $count: true,
            };
            const headers = {
                "Prefer": "return=representation, odata.maxpagesize=20",
            };
            for (const it of args) {
                query = {
                    ...query,
                    ...it,
                }
            }
            const { success, data, error } = await this.traport.request({}, 'GET', query, headers);
            if (success) {
                return { success, data };
            }
            return {success, error };
        } catch (error) {
            return {success: false, error: error.message};
        }
    }
    async getApplication () {
        try {
            const filter = {
                "$expand": "*",
            };
            const { success, data, error } = await this.traport.request({}, 'GET', filter);
            if (success) {
                return { success, data };
            }
            return {success, error };
        } catch (error) {
            return {success: false, error: error.message};
        }
    }
    async getConsoltium(payload) {
        try {
            const filter = {
                "$filter": ` eMail eq '${payload.eMail}' ` 
            };
            const { success, data, error } = await this.traport.request({}, 'GET', filter);
            if (success) {
                return { success, data };
            }
            return {success, error };
        } catch (error) {
            return {success: false, error: error.message};
        }
    }
    async OnboardApplication(payload, params) {
        try {
            const { success, data, error } = await this.traport.request(payload, 'POST', params);
            if (success) {
                return { success, data };
            }
            return {success, error };
        } catch (error) {
            return {success: false, error: error.message};
        }
    }
    async leaveFeedback(feedback) {
        try {
            const { success, data, error } = await this.traport.request(feedback, 'POST');
            if (success) {
                return { success, data };
            }
            return {success, error };
        } catch (error) {
            return {success: false, error: error.message};
        }
    }
    async getFeedbackHistory(query) {
        try {
            query['$expand'] = "*";
            const { success, data, error } = await this.traport.request({}, 'GET', query);
            if (success) {
                return { success, data };
            }
            return { success, error };
        } catch (error) {
            return {success: false, error: error.message};
        }
    }
    async navigateToNext() {
        try {
            const { success, data, error } = await this.traport.request({}, 'GET');
            if (success) {
                return { success, data };
            }
            return { success, error };
        } catch (error) {
            return { success: false, error: error.message};
        }
    }
}