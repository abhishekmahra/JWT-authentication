import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('usersdb', 'abhishek', 'Rubi@123', {
  host: 'localhost',
  dialect: 'mysql',
});

export const dbConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate(); //use of authenticate to check if the connection is OK
    console.log('Connection established successfully.');
  } catch (error) {
    console.error('Cant connect to db:', error);
  }
};

export default sequelize;
 