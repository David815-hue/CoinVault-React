/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers });
		}
		if (url.pathname === '/register' && request.method === 'POST') {
			const { email, password, name } = await request.json();
			// En producción: HASH del password (bcryptjs)
			const user = { email, password, name, isAdmin: false, createdAt: new Date().toISOString() };
			await env.USERS.put(email, JSON.stringify(user));
			return new Response(JSON.stringify(user), { headers });
		}
		if (url.pathname === '/login' && request.method === 'POST') {
			const { email, password } = await request.json();
			const userStr = await env.USERS.get(email);

			if (!userStr) return new Response('Usuario no encontrado', { status: 404, headers });

			const user = JSON.parse(userStr);
			if (user.password !== password) return new Response('Contraseña incorrecta', { status: 401, headers });

			// En producción: Generar JWT
			return new Response(JSON.stringify(user), { headers });
		}
		return new Response('Not Found', { status: 404, headers });
	},
};