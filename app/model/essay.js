import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";
import Biodata from "./biodata.js";


const Essay = sequelize.define('Essay',{
    heading: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: false,
    },
},
{
    tableName: 'essays',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

Biodata.hasOne(Essay, {
    foreignKey: 'essayId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});
Essay.belongsTo(Biodata, {
    foreignKey: 'applicantId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

Essay.sync();


export default Essay;