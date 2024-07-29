export default {
    url: process.env.BC_URL,
    odata_url: process.env.BC_ODATA_URL,
    username: process.env.BC_USERNAE,
    password: process.env.BC_PASSWORD,
    company: process.env.BC_COMPANY,
    domain: process.env.BC_DOMAIN || 'domain',
    workstation: process.env.BC_WORKSTATION,
};