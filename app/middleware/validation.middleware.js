class Validator {
    async education(educationArray) {
        try {
            if (!Array.isArray(educationArray)) {
                return { success: false }
            }
            let isValid = true;
            educationArray.forEach((education) => {
                const educationLevel = [
                    {
                        description: 'PHD',
                        code: 'PHD'
                    },
                    {
                        description: 'Masters',
                        code: 'MASTERS'
                    },
                    {
                        description: 'Bachelors',
                        code: 'BACHELORS'
                    },
                    {
                        description: 'Diploma',
                        code: 'DIPLOMA'
                    },
                    {
                        description: 'Certificate',
                        code: 'CERTIFICATE'
                    }
                ];
                const na = /N([^a-zA-Z0-9])A/;
                const space = /\s/
                let emptySpace = false

                const edLevel = educationLevel.findIndex(levelObject => levelObject.code === education.educationLevel);
                if (edLevel === -1) {
                    isValid = false;
                    return { success: false, message: "Invalid OPTION" };
                }
                if (typeof education.yearOfStart !== 'number' || typeof education.yearOfGraduation !== 'number') {
                    isValid = false;
                    return { success: false, message: "NAN" };
                }
                for (const prop in education) {
                    if (!education[prop]) {
                        isValid = false;
                        return { success: false, message: "INVALID" };
                    }
                    if (education[prop] === "NA") {
                        isValid = false;
                        return { success: false, message: "NA" };
                    }
                    if (education[prop] === "undefined" ||education[prop] === "NULL") {
                        isValid = false;
                        return { success: false, message: "NA" };
                    }
                    if (na.test(education[prop])) {
                        isValid = false;
                        return { success: false, message: "NA" };
                    }
                    if (typeof education[prop] === "string") {
                        education[prop]
                            .trim()
                            .split('')
                            .forEach((c) => {
                                if (space.test(c)) {
                                    emptySpace = true;
                                }
                            })
                    }
                    if (emptySpace) {
                        isValid = false;
                        return { success: false, message: "space is empty" };
                    }
                }
            })
            return { success: isValid, message: "" };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    async professionalBody(body) {
        try {
            if (!Array.isArray(body)) {
                return { success: false }
            }
            let isValid = true;
            const space = /\s/;
            const na = /N([^a-zA-Z0-9])A/;
            let emptySpace = false
            body.forEach((org) => {
                for (const prop in org) {
                    if (org[prop] === "NA") {
                        isValid = false;
                        return { success: false, message: "NA" };
                    }
                    if (na.test(org[prop])) {
                        isValid = false;
                        return { success: false, message: "NA" };
                    }
                    org[prop]
                        .trim()
                        .split('')
                        .forEach((c) => {
                            if (space.test(c)) {
                                emptySpace = true;
                            }
                        })
                    if (emptySpace) {
                        isValid = false;
                        return { success: false, message: "EMPTY SPACE" };
                    }
                }
            })
            return { success: isValid };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new Validator();