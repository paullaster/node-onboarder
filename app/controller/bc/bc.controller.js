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

    async getEducation() {
        return await this.bc.getEducation();
    }

    async getEssay() {
        return await this.bc.getEssay();
    }

    async getSkills() {
        return await this.bc.getSkills();
    }

    async getReferences() {
        return await this.bc.getReferences();
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