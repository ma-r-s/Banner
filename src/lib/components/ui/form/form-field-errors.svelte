<script>
	import * as FormPrimitive from 'formsnap';
	import { cn } from '$lib/utils';
	let className = undefined;
	export { className as class };
	export let errorClasses = undefined;
	export let bail = true; // <- (aka abort-only) on the first of any validation errors
</script>

<FormPrimitive.FieldErrors
	class={cn('text-[0.8rem] font-medium text-destructive', className)}
	{...$$restProps}
	let:errors
	let:fieldErrorsAttrs
	let:errorAttrs
>
	<slot {errors} {fieldErrorsAttrs} {errorAttrs}>
		{#each errors as error, i}
			{#if !bail || i === 0}
				<div {...errorAttrs} class={cn(errorClasses)}>{error}</div>
			{/if}
		{/each}
	</slot>
</FormPrimitive.FieldErrors>
