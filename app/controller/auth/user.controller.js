import U
export class UserController {
    constructor() {
        this.login = this.login.bind(this);
    }
    async login(req, res) {
        const { email, password } = req.body;
        // Implement your login logic here
        res.ApiResponse.success({ message: 'Login successful' });
    }
    async activateAccount(req, res) {}
    async forgotPassword(req, res) {}
    async resetPassword(req, res) {}
    async addConsotium(req, res) {
       try {
         if (!req.body) return res.ApiResponse.error(500, "Missing payload");
         if (req.query || req.query.type) return res.ApiResponse.error(500, "missing type query");

         req.body.role = req.query?.type === 'consultium'?  3 : 4; 

         res.ApiResponse.success({ message: 'Consotia added successfully' });
       } catch (error) {
        return res.ApiResponse.error(500, error.message);
       }
    }
}