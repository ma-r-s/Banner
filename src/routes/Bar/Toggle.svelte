<script>
	import { Button } from '$lib/components/ui/button';
	import { toggleMode } from 'mode-watcher';
	import { SunMedium, Moon } from 'lucide-svelte';
</script>

<Button on:click={toggleMode} variant="ghost" size="icon">
	<SunMedium class="size-4 dark:hidden" />
	<Moon class="hidden size-4 dark:block" />
	<span class="sr-only">Toggle theme</span>
</Button>
