import { Model, DataTypes } from 'sequelize';
import sequelize from '../database';

class UsersModel extends Model {
    declare id: number;
    declare name: string ;
    declare email: string ;
    declare password: string ;
}

UsersModel.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'UsersModel',
    tableName: 'usersTable', 
});

(async () => {
    await sequelize.sync({alter:true});
})();

export default UsersModel;
