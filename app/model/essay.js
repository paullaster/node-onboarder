import { sequelize } from "../../database/index.js";
import { DataTypes } from "sequelize";

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
    applicantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false
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

Essay.sync();


export default Essay;