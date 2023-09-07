// Define your Swagger options
const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0', // Atur versi OpenAPI (3.0.0 disarankan)
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      components: {
      // securitySchemes: {
      //   bearerAuth: { // Nama autentikasi
      //     type: 'http',
      //     scheme: 'bearer',
      //     bearerFormat: 'JWT', // Format bearer token, sesuaikan dengan kebutuhan Anda
      //   },
      // },
    },
    //security: [{ bearerAuth: [] }], 
    },
    apis: ['./app.js'], // Specify the path to your route files
  };
  
  module.exports = {
    swaggerOptions
  };
