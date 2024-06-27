import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";

const Biodata = sequelize.define('Biodata',{
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    middleName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    dob: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
    },
    idNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    pinNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    countyOfBirth: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    profession: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false
    },
    registeredProfessional: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        unique: false,
    },
    currentlyEmployed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        unique: false,
    },
    declaration: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        unique: false,
    },
},
{
    tableName: 'biodata',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

Biodata.sync();


export default Products;