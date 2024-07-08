import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";
import Biodata from "./biodata.js";

const Application = sequelize.define('Application',{
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        defaultValue: 'New',
        values: ['New', 'Pending', 'Denied', 'Approved'],

    },
    reviewedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    estate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    village: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    }
},
{
    tableName: 'applications',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

Biodata.hasOne(Address, {
    foreignKey: 'applicantId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


Address.belongsTo(Biodata, {
    foreignKey: 'applicantId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Application.sync();


export default Application;