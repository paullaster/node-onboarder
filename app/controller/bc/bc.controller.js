export class BCController {
    constructor(traport) {
        this.traport = traport;
        this.postapplicant = this.postapplicant.bind(this);
        this.getSetups = this.getSetups.bind(this);
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
            const data = await this.traport.request();
            return res.ApiResponse.success(data, 200, );
        } catch (error) {
            return res.ApiResponse.error(error.message);
        }
    }

    async getApplications(filters) {
        try {
            const filter = {
                "$filter": filters,
                "$expand": "*",
            };
            const { success, data, error } = await this.traport.request(filter, 'GET');
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
            const { success, data, error } = await this.traport.request(filter, 'GET');
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
            const { success, data, error } = await this.traport.request(filter, 'GET');
            if (success) {
                return { success, data };
            }
            return {success, error };
        } catch (error) {
            return {success: false, error: error.message};
        }
    }
}