import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";
import Biodata from "./biodata.js";

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
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
    },
    yearOfGraduation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
    }
},
{
    tableName: 'education',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

Biodata.hasMany(Education, {
    foreignKey: 'educationId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Education.belongsTo(Biodata, {
    foreignKey: 'applicantId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    as: 'Education',
});

Education.sync();


export default Education;