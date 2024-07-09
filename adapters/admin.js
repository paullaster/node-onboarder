import {AdminJS} from 'adminjs'
import * as  AdminJSSequelize from '@adminjs/sequelize'

AdminJS.registerAdapter(AdminJSSequelize)

export const Admin = new AdminJS({
 databases: [SequelizeAdapter],
 rootPath: '/admin',
})

