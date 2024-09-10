<script>
	import '../app.css';

	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '$lib/components/ui/sonner';
	import Bar from './Bar/Bar.svelte';
	export let data;
</script>

<div class="container py-10">
	<Bar {data}></Bar>
	<slot />
	<Toaster />
	<ModeWatcher />
</div>
