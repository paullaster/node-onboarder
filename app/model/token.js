import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";
import User from './user.js'

const Token = sequelize.define('Token',{
    key: {
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
    tableName: 'token',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

User.hasOne(Token, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})

Token.belongsTo(User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
})

Token.sync();

export default Token;
