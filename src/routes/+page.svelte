<script lang="ts">
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

<div class="max-w-md h-full flex flex-col items-center mx-auto">
	<ul class="flex flex-col flex-grow w-full overflow-y-auto">
		{#each toDialogueStructs($dialogue) as ds}
			<li class="ml-auto p-5">
				<p class="w-[200px] bg-cyan-900 rounded-l-lg rounded-br-lg p-5">
					{ds.you}
				</p>
			</li>
			{#if ds.al}
				<li class="mr-auto p-5">
					<p class="w-[200px] bg-violet-900 rounded-r-lg rounded-bl-lg p-5">
						{ds.al}
					</p>
				</li>
			{/if}
		{/each}
	</ul>

	<form
		class="mb-5 w-full"
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
		<textarea
			class="mt-1 px-3 py-2 bg-gray-800 shadow-sm 
      border-slate-500 border-2 placeholder-slate-400 focus:outline-none 
      focus:border-violet-500 focus:ring-violet-500 block w-full rounded-lg 
      sm:text-sm focus:ring-1 resize-none"
			placeholder="What's on your mind?"
			bind:value={latestInput}
			rows="3"
		/>
		<div class="flex justify-between mt-5">
			<button
				class="bg-cyan-600 rounded-sm p-2 flex items-center gap-1 
        hover:bg-cyan-700 focus:outline-none focus:ring 
        focus:ring-cyan-900"
				type="button"
				on:click={() => recognition.start()}
			>
				<Stop slot="leftIcon" />
				Listen</button
			>
			<button
				class="flex items-center bg-violet-600 
        hover:bg-violet-700 rounded-sm p-2 gap-1 
        focus:ring focus:outline-none
        focus:ring-violet-900"><PaperPlane slot="leftIcon" /> Submit</button
			>
		</div>
	</form>
</div>

<style>
	li {
		list-style: none;
	}
</style>
