import {AdminJS} from 'adminjs'
import {AdminJSSequelize} from '@adminjs/sequelize'

AdminJS.registerAdapter(AdminJSSequelize)

export const Admin = new AdminJS({
 databases: [SequelizeAdapter],
 rootPath: '/admin',
})

