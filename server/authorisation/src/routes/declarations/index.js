/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:14:16 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-07-05 13:36:42
 */

const Joi = require('joi');

const location = Joi.object().keys({
    placeOfDelivery: Joi.string(),
    attendantAtBirth: Joi.string(),
    hospitalName: Joi.string(),
    addressLine1: Joi.string(),
    addressLine2: Joi.string(),
    addressLine3: Joi.string(),
    city: Joi.string(),
    county: Joi.string(),
    state: Joi.string(),
    postalCode: Joi.string()
});

const declarationSchema = Joi.object().keys({
    motherDetails: Joi.string(),
    uuid: Joi.string(),
    motherDetails: Joi.number(),
    fatherDetails: Joi.number(),
    childDetails: Joi.number(),
    status: Joi.string(),
    locations: Joi.array().items(location)
});

exports.register = (server, options, next) => {

    server.route({

        path: '/declarations',
        method: 'GET',
        config: {
            auth: 'jwt',
            description: 'Protected route to retrieve declarations.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        },
        handler: require('./get')
    });

    server.route({

        path: '/declarations',
        method: 'POST',
        config: {
            auth: 'jwt',
            description: 'Protected route to create a declaration.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                payload: declarationSchema
            }
        },
        handler: require('./post')
    });

    server.route({

        path: '/declarations/{id}',
        method: 'PUT',
        config: {
            auth: 'jwt',
            description: 'Protected route to update a declaration.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            },
            validate: {
                payload: declarationSchema
            }
        },
        handler: require('./put')
    });

    server.route({

        path: '/declarations/{id}',
        method: 'DELETE',
        config: {
            auth: 'jwt',
            description: 'Protected route to delete a declaration.',
            notes: 'Token and message scopes are required.',
            tags: ['api'],
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form'
                }
            }
        },
        handler: require('./delete')
    });

    next();
};

exports.register.attributes = {
    name: 'declaration-routes'
};
