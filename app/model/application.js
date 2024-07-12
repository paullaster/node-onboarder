import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";
import Biodata from "./biodata.js";

const Application = sequelize.define('Application',{
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
        defaultValue: 0,
        values: [0, 1, 2, 3, 4],

    },
    synced: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
        defaultValue: false,
    },
    receivedNotified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
        defaultValue: false,
    },
},
{
    tableName: 'applications',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

Biodata.hasOne(Application, {
    foreignKey: 'applicantId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


Application.belongsTo(Biodata, {
    foreignKey: 'applicantId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Application.sync();


export default Application;
