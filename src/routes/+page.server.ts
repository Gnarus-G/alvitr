import type { Actions } from './$types';

import { Configuration, OpenAIApi } from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const cfg = new Configuration({
	apiKey: OPENAI_API_KEY
});

const openai = new OpenAIApi(cfg);

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();

		const prompt = form.get('prompt')?.toString();

		console.log({ prompt });

		const { data } = await openai.createCompletion({
			model: 'text-davinci-003',
			prompt,
			max_tokens: 256,
			temperature: 0.7,
			frequency_penalty: 0.0,
			presence_penalty: 0.6,
			stop: ['You:', 'Al:']
		});

		return {
			reply: data.choices.at(0)?.text
		};
	}
};
