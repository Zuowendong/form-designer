<template>
	<div class="w-full h-full grid gap-1" :style="formConStyle">
		<div v-for="(item, i) in maskList" :key="i" :data-index="i" style="outline: 1px dashed #ccc">
			<slot :component="item" :index="i"></slot>
		</div>
	</div>
</template>

<script lang="ts">
export default { name: 'WdForm' };
</script>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue';

const props = defineProps({
	list: { type: Array, default: () => [] },
	row: { type: Number, default: 4 },
	column: { type: Number, default: 2 }
});
const { row, column, list } = toRefs(props);
let maskList = ref<any[]>([]);
maskList.value = new Array(row.value * column.value);
maskList.value = Object.assign(maskList.value, list.value);

watch(
	() => props.list,
	(val) => {
		maskList.value = Object.assign(maskList.value, val);
	},
	{ deep: true }
);
let rowNum = ref<number>(row.value);
watch(
	() => props.row,
	(num) => {
		rowNum.value = num;
		maskList.value = new Array(num * column.value);
	}
);
let columnNum = ref<number>(column.value);
watch(
	() => props.column,
	(num) => {
		columnNum.value = num;
		maskList.value = new Array(row.value * num);
	}
);
const formConStyle = computed(
	() =>
		`grid-template-columns: repeat(${columnNum.value}, 1fr); grid-template-rows: repeat(${rowNum.value}, 1fr);`
);
</script>

<style scoped></style>
