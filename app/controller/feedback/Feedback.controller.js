export class FeedbackController {
    constructor(BCInstance) {
        this.BCInstance = BCInstance;
        this.leaveFeedback = this.leaveFeedback.bind(this);
        this.getFeedbackHistory = this.getFeedbackHistory.bind(this);
    }

    async leaveFeedback(req, res) {
        try {
            if (!req.body) {
                return res.ApiResponse.error(500, "Missing feedback data");
            }
            const {success, data, error } = await this.BCInstance.leaveFeedback(req.body);
            if (success) {
                return res.ApiResponse.success(data, 200, "Feedback sent successfully");
            }
            return res.ApiResponse.error(500, "System Error:  " + error);
        } catch (error) {
            return res.ApiResponse.error(500, "System Error:  " +  error.message);
        }
    }

    // Retrieve feedback history for a specific user
    async getFeedbackHistory(req, res) {
       try {
        if (!req.query.documentNo) {
            return res.ApiResponse.error(500, "Document not known!");
        }
        let qString;
        for(const key in req.query){
            qString = `${qString? qString + " and " : ""}${key} eq '${req.query[key]}'`
        }
        const query = {
            $filter: qString,
        }
        const { success, data, error } = await this.BCInstance.getFeedbackHistory(query)
        if (success) {
            return res.ApiResponse.success(data, 200, "Feedback history retrieved successfully");
        } else {
            return res.ApiResponse.error(500, "System Error:  " + error);
        }
       } catch (error) {
        return res.ApiResponse.error(500, "System Error:  " +  error.message);
       }
        }
}