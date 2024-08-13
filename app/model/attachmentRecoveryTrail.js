import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";

const RecoveredAttachment = sequelize.define('RecoveredAttachment',{
    applicantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
    },
},
{
    tableName: 'recoveredAttachments',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});


RecoveredAttachment.sync();


export default RecoveredAttachment;