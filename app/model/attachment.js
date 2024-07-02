import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";
import Biodata from "./biodata.js";

const Attachment = sequelize.define('Attachment',{
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
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

Biodata.hasMany(Attachment, {
    foreignKey: 'attachmentId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Attachment.belongsTo(Biodata, {
    foreignKey: 'applicantId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Attachment.sync();


export default Attachment;