<script>
	import '../app.css';
</script>

<main class="bg-gray-900 text-gray-200">
	<slot />
</main>

<style lang="postcss">
	:global(html, body, main) {
		height: 100vh;
	}
</style>
