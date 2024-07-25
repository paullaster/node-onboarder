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
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
        defaultValue: 'user',
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,        
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        unique: false,
        defaultValue: new Date()
    },
    active:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
        defaultValue: false
    },
    phone:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
    },
    consoltium:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
    },
    belongsTo:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
    },
    title:{
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
    },
    emailed:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
        defaultValue: false
    },
    categoriesFilter:{
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,
    },
    countiesFilter:{
        type: DataTypes.TEXT,
        allowNull: true,
        unique: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        unique: false,
        defaultValue: false,
    }
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
