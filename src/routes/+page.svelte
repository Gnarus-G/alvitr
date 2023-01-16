<script lang="ts">
	import { Box, Button, Center, Container, Group, TextInput } from '@svelteuidev/core';
	import { PaperPlane, Stop } from 'radix-icons-svelte';
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

<Container
	size="xs"
	override={{ height: '100vh', display: 'flex', flexDirection: 'column', ai: 'center' }}
>
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

	<Box css={{ position: 'absolute', bottom: '$10' }}>
		<Center>
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
				<TextInput placeholder="What's on your mind?" bind:value={latestInput} multiline />
				<Group position="apart" mt="xs">
					<Button color="cyan" on:click={() => recognition.start()}>
						<Stop slot="leftIcon" />
						Listen</Button
					>
					<Button color="grape"><PaperPlane slot="leftIcon" /> Submit</Button>
				</Group>
			</form>
		</Center>
	</Box>
</Container>
