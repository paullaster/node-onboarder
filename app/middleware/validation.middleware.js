class Validator{
    async education(educationArray) {
        try {
            if (!Array.isArray(educationArray)) {
                return { success: false}
            }
            let isValid = true;
            educationArray.forEach((education) => {
                for (const prop in education) {
                    if (education[prop] === undefined || education[prop] === "" || education[prop] === " ") {
                        isValid = false;
                        break;
                }
            }
            })
            return { success: isValid};
        } catch (error) {
            return {success: false, error: error.message};
        }
    }
    async professionalBody(body) {
        try {
            if (!Array.isArray(body)) {
                return { success: false}
            }
            let isValid = true;
            body.forEach((org) => {
                for (const prop in org) {
                    if (org[prop] === undefined || org[prop] === "" || org[prop] === " ") {
                        isValid = false;
                        break;
                }
            }
            })
            return { success: isValid};
        } catch (error) {
            return {success: false, error: error.message};
        }
    }
}

export default new Validator();