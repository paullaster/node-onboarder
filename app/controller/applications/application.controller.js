class ApplicationController {
    constructor() {
        this.application = this.application.bind(this);
    }
    async application (req, res) {
        try {
            if (!req.body) {

            }
            const {
                physicalAddress,
                education,
                professionalBodys,
                workExperience,
                attachments,
                ...rest
            } = req.body;
        } catch (error) {
        }
    }
}