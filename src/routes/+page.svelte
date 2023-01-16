<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPrompt, toDialogueStructs } from '$lib';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
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

	let dialogue = writable([] as string[]);

	$: {
		if (form?.reply) {
			dialogue.update((d) => {
				d.push(form!.reply!);
				return d;
			});
			speechSynthesis.speak(new SpeechSynthesisUtterance(form.reply));
		}
	}
</script>

<svelte:head>
	<title>Alvitr</title>
</svelte:head>
<main>
	<ul>
		{#each toDialogueStructs($dialogue) as ds}
			<li>
				You: {ds.you}
			</li>
			{#if ds.al}
				<li>Al: {ds.al}</li>
			{/if}
		{/each}
	</ul>

	<button on:click={() => recognition.start()}>Start</button>
	<button on:click={() => recognition.stop()}>Stop</button>

	<form
		method="post"
		use:enhance={({ data }) => {
			dialogue.update((d) => {
				d.push(latestInput);
				return d;
			});
			data.set('prompt', formatPrompt($dialogue));
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
