export default () => ({
  databaseUrl: process.env.DATABASE_URL,
  tcp: {
    host: process.env.TCP_HOST || '127.0.0.1',
    port: parseInt(process.env.TCP_PORT || '8877', 10),
  },
  httpPort: parseInt(process.env.HTTP_PORT || '3000', 10),
});
