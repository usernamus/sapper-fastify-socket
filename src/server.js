import path from 'path';

import fastify from 'fastify';
import fastifyStatic from 'fastify-static';

import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const app = fastify();

app.register(fastifyStatic, {
	root: path.join(__dirname, '../../../static'),
	wildcard: false,
});

app.route({
	method: 'GET',
	url: '/*',
	handler: async (request, reply) => {
		const next = (error) => {
			if (error) throw error;

			reply.status(404).send();
		};

		request.originalUrl = request.raw.url;

		reply.setHeader = reply.header;
		reply.writeHead = reply.code;
		reply.end = reply.send;

		const sapperMiddleware = sapper.middleware({
			session: ({ user }) => {
				if (user) return user;

				return undefined;
			},
		});

		await sapperMiddleware(request, reply, next);

		return reply;
	},
});

app.listen(PORT, 'localhost');
