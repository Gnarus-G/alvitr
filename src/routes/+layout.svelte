<script>
	import { SvelteUIProvider } from '@svelteuidev/core';
</script>

<main>
	<SvelteUIProvider withGlobalStyles themeObserver="dark" ssr>
		<slot />
	</SvelteUIProvider>
</main>

<style>
	main {
		height: 100vh;
	}
</style>
