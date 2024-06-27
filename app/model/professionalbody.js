import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";

const ProfessionalBody = sequelize.define('ProfessionalBody',{
    bodyName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    membershipNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    membershipType: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    applicantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
    }
},
{
    tableName: 'professionalBodies',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

ProfessionalBody.sync();


export default ProfessionalBody;