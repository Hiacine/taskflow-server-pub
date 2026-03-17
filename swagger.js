const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: "3.0.0",


components:{
  securitySchemes:
   { bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT", 
    }
    }

},
security:
  [
    {
        bearerAuth: []
    }
],
        info: {
            title: 'API de gestion de tâches',
            version: '1.0.0',
            description: "Documentation de l'api permettant de gérer les projects, taches, tags et les users"
        },
        servers: [
            {
                url: 'http://localhost:3000'
            }
        ]
    },
    apis: ["./ROUTES/*.js"]
}

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger
