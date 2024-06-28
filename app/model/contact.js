import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";

const Contact = sequelize.define('Contact',{
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    email: {
        type: DataTypes.STRING,
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
    tableName: 'contacts',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

Contact.sync();


export default Contact;