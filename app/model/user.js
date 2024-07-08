import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";

const User = sequelize.define('User',{
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    role: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
        defaultValue: 10,
    },
},
{
    tableName: 'users',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

User.sync();


export default User;