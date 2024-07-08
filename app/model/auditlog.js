import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";
import Biodata from "./biodata.js";
import Application from './application.js'

const AuditLog = sequelize.define('AuditLog',{
    from: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        defaultValue: 0,
        values: [0, 1, 2, 3, 4],
    },
    to: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        defaultValue: 0,
        values: [0, 1, 2, 3, 4],
    },
    comment:{
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false
    }
},
{
    tableName: 'auditLog',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

AuditLog.hasOne(Application, {
    foreignKey: 'applicationId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


AuditLog.belongsTo(Application, {
    foreignKey: 'applicationId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

AuditLog.hasOne(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


AuditLog.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});



AuditLog.sync();


export default AuditLog;
