import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";
import User from './user.js'

const OTP = sequelize.define('OneTimePassword',{
    passcode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: false,
        unique: false
    }
},
{
    tableName: 'oneTimePassword',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

User.hasOne(OTP, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})

OTP.belongsTo(User, {
    foreignKey: 'userId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})

OTP.sync();

export default OTP;
