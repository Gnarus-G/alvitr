<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { ActionData } from './$types';
	export let form: ActionData;

	let recognition: SpeechRecognition;

	let latestInput = '';

	onMount(() => {
		recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.lang = 'en-US';
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;

		recognition.onresult = (event) => {
			latestInput = event.results[event.results.length - 1][0].transcript;
		};
	});

	const prelude =
		'The following is a conversation between you and an AI assistant named Al. Al is helpful, creative, clever, and very friendly.';

	let dialogue: string[] = [];

	function formatPrompt(dialogue: string[]) {
		type TwoAtMost = [string] | [string, string];
		let result: TwoAtMost[] = [];
		for (let i = 0; i < dialogue.length; i += 2) {
			let chunk = dialogue.slice(i, i + 2) as TwoAtMost;
			result.push(chunk);
		}

		let newPrompt = result
			.map(([you, al]) => {
				if (al) {
					return `You: ${you}\n\nAl: ${al}`;
				}
				return `You: ${you}\n\nAl:`;
			})
			.join('\n\n');

		return `${prelude}\n\n${newPrompt}`;
	}

	$: {
		if (form?.reply) {
			dialogue.push(form.reply);
		}
	}
</script>

<h1>Welcome to Alvitr or Allvis (wip)</h1>
<main>
	<button on:click={() => recognition.start()}>Start</button>
	<button on:click={() => recognition.stop()}>Stop</button>

	<form
		method="post"
		use:enhance={({ data }) => {
			dialogue.push(latestInput);
			data.set('prompt', formatPrompt(dialogue));
			return async ({ update }) => {
				update();
			};
		}}
	>
		<label>
			Ask
			<textarea name="input" bind:value={latestInput} />
		</label>
		<button>Submit</button>
	</form>

	{#if form?.reply}
		<p>{form.reply}</p>
	{/if}
</main>
