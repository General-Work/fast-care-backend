import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();
// console.log(process.env.DATABASE)
export const dataSourceOptions: DataSourceOptions = {
  type: 'mssql',
  host: `${process.env.DB_HOST}`,
  port: Number(`${process.env.DB_PORT}`),
  username: `${process.env.DB_USERNAME}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_DATABASE}`,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: [],
  // migrations: ['dist/db/migrations/*{.ts,.js}'],

  logging: false,
  synchronize: true,
  options: {
    // multipleActiveResultSets:true
    // instanceName: 'SQLEXPRESS',
    // encrypt: true,
    trustServerCertificate: true,
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
