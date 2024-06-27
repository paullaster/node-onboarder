import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";

const Education = sequelize.define('Education',{
    educationLevel: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    institution: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    degree: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    yearOfStart: {
        type: DataTypes.DATETIME,
        allowNull: false,
        unique: false,
    },
    yearOfGraduation: {
        type: DataTypes.DATETIME,
        allowNull: false,
        unique: false,
    },
},
{
    tableName: 'education',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

Education.sync();


export default Education;