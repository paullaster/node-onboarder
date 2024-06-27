import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";

const Attachment = sequelize.define('Attachment',{
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    url: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
    },
    applicantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false
    },
},
{
    tableName: 'attachments',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

Attachment.sync();


export default Attachment;