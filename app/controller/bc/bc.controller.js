export class BCController {
    constructor(traport) {
        this.traport = traport;
        this.postapplicant = this.postapplicant.bind(this);
    }

    async postapplicant(applicant) {
        try {
            console.log("Called BC Controller", this.traport)
            return {success: true, data: this.traport.request(applicant, 'POST')};
        } catch (error) {
            return {vsuccess: false, error: error.message}
        }
    }

    async getWorkExperience() {
        return await this.bc.getWorkExperience();
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
}