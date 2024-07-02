import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";
import Biodata from "./biodata.js";

const WorkExperience = sequelize.define('WorkExperience',{
    companyName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    jobTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    jobDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false
    }
   
},
{
    tableName: 'workExperience',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

Biodata.hasOne(WorkExperience, {
    foreignKey: 'applicantId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});


WorkExperience.belongsTo(Biodata, {
    foreignKey: 'applicantId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

WorkExperience.sync();


export default WorkExperience;