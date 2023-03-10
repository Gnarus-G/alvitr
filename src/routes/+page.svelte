<script lang="ts">
	import { PaperPlane, Pause, Stop } from 'radix-icons-svelte';
	import { enhance } from '$app/forms';
	import { formatPrompt, toDialogueStructs } from '$lib';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import type { ActionData } from './$types';
	export let form: ActionData;

	let recognition: SpeechRecognition;
	let isListening = false;
	let voice: SpeechSynthesisVoice;
	let latestInput = '';

	let chatWin: HTMLUListElement;

	onMount(() => {
		recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.lang = 'en-US';
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;

		recognition.onstart = () => {
			isListening = true;
		};
		recognition.onspeechend = () => {
			isListening = false;
		};

		recognition.onresult = (event) => {
			latestInput = event.results[event.results.length - 1][0].transcript;
		};
	});

	function toggleSpeechRecognition() {
		if (isListening) {
			return recognition.stop();
		}
		return recognition.start();
	}

	function pickVoice() {
		const voices = speechSynthesis.getVoices();
		voice = voices.find((v) => v.name.includes('Male'))!;
		console.log({ voice, voices });
	}

	onMount(() => {
		speechSynthesis.onvoiceschanged = () => pickVoice();
	});

	onMount(() => {
		function scrollToBottom() {
			chatWin.children.item(chatWin.children.length - 1)?.scrollIntoView({
				behavior: 'smooth'
			});
		}

		new MutationObserver(() => scrollToBottom()).observe(chatWin, { childList: true });
	});

	let dialogue = writable([] as string[]);

	$: {
		if (form?.reply) {
			dialogue.update((d) => {
				d.push(form!.reply!);
				return d;
			});

			const utterance = new SpeechSynthesisUtterance(form.reply);
			utterance.voice = voice;
			speechSynthesis.speak(utterance);
		}
	}
</script>

<svelte:head>
	<title>Alvitr</title>
</svelte:head>

<div class="max-w-md h-full flex flex-col items-center mx-auto p-5">
	<ul
		bind:this={chatWin}
		class="flex flex-col flex-grow w-full overflow-y-auto gap-5 
    scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-700 scrollbar-track-gray-900"
	>
		{#each toDialogueStructs($dialogue) as ds}
			<li class="ml-auto">
				<p class="w-[200px] bg-cyan-900 rounded-l-lg rounded-br-lg p-5">
					{ds.you}
				</p>
			</li>
			{#if ds.al}
				<li class="mr-auto">
					<p class="w-[200px] bg-violet-900 rounded-r-lg rounded-bl-lg p-5">
						{ds.al}
					</p>
				</li>
			{/if}
		{/each}
	</ul>

	<form
		class="w-full"
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
		<input
			class="mt-1 px-3 py-2 bg-gray-800 shadow-sm 
      border-slate-500 border-2 placeholder-slate-400 focus:outline-none 
      focus:border-violet-500 focus:ring-violet-500 block w-full rounded-lg 
      sm:text-sm focus:ring-1 resize-none"
			placeholder="What's on your mind?"
			bind:value={latestInput}
		/>
		<div class="flex justify-between mt-2">
			<button
				class="bg-cyan-600 rounded-md p-2 px-3 flex items-center gap-1 
        hover:bg-cyan-700 focus:outline-none focus:ring 
        focus:ring-cyan-900"
				type="button"
				on:click={toggleSpeechRecognition}
			>
				{#if isListening}
					<Pause slot="leftIcon" />
				{:else}
					<Stop slot="leftIcon" />
				{/if}
				Listen</button
			>
			<button
				class="flex items-center bg-violet-600 px-3 
        hover:bg-violet-700 rounded-md p-2 gap-1 
        focus:ring focus:outline-none
        focus:ring-violet-900"
				>Submit <PaperPlane slot="leftIcon" />
			</button>
		</div>
	</form>
</div>

<style>
	li {
		list-style: none;
	}
</style>
