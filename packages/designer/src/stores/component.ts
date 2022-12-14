import { defineStore } from 'pinia';
import { cloneDeep } from 'lodash-es';
import type { ComponentModel, propertyModel } from '../types/component';
import { useSideMenus } from './sideMenus';

export const useComponentStore = defineStore('component', () => {
	// 编辑器dom
	const editorDom = ref();
	const setEditorDom = (refObj: HTMLElement) => {
		editorDom.value = refObj;
	};

	// 当前组件
	const currentComponent = ref<ComponentModel>({ id: '', label: '', key: '', style: {} });
	const currentComponentId = ref<string>('');
	const setCurrentComponent = (component: ComponentModel, compId: string) => {
		currentComponent.value = component;
		currentComponentId.value = compId;
	};
	// 活动对象树设置当前组件
	const setCurrentComponentById = (id: string) => {
		// 递归 ---Maximum call stack size exceeded---> 堆栈溢出
		// for (let i = 0; i < components.length; i++) {
		// 	if (components[i].id === id) {
		// 		currentComponent.value = components[i];
		// 		currentComponentId.value = id;
		// 		return;
		// 	}
		// 	if (components[i].children && components[i].children?.length) {
		// 		setCurrentComponentById(id);
		// 	}
		// }

		// bfs
		const queue = cloneDeep(components);
		while (queue.length) {
			const node = queue.shift();
			if (node?.id === id) {
				currentComponent.value = node;
				currentComponentId.value = id;
			}
			if (!node?.children?.length) {
				continue;
			}
			Array.from(node.children).forEach((item) => {
				queue.push(item);
			});
		}
	};
	// 设置当前组件的shapebox样式
	const setShapeStyle = (props: propertyModel) => {
		const { top, left, width, height, rotate } = props;
		if (top) currentComponent.value.style.top = Math.round(top);
		if (left) currentComponent.value.style.left = Math.round(left);
		if (width) currentComponent.value.style.width = Math.round(width);
		if (height) currentComponent.value.style.height = Math.round(height);
		if (rotate) currentComponent.value.style.rotate = Math.round(rotate);
	};
	// 取消or选中组件
	const isChoosedComponent = ref<boolean>(false);
	const setChoosedComponentStatus = (status: boolean) => {
		isChoosedComponent.value = status;
	};
	const updateCurrentComponent = (props: propertyModel) => {
		// 当前数据已经先push components，更新当前数据也会更新数组中数据
		Object.keys(props).forEach((propKey: string) => {
			const propValue = props[propKey];
			currentComponent.value.style[propKey] = propValue;
		});
		// updateComponents(currentComponent.value.id);
	};

	// 画布中所有组件
	const components = reactive<ComponentModel[]>([]);
	const addComponent = (component: ComponentModel) => {
		components.push(component);
	};
	// const updateComponents = (id: string) => {
	// 	for (let i = 0; i < components.length; i++) {
	// 		if (components[i].id === id) {
	// 			components[i] = currentComponent.value;
	// 		}
	// 		if (components[i].children && components[i].children!.length) {
	// 			updateComponents(id);
	// 		}
	// 	}
	// };
	// 添加组件到容器
	const addCompInContainer = (id: string, component: ComponentModel, index: number) => {
		const containerComp = components.find((compItem) => compItem.id === id);
		if (containerComp) {
			// 指定插入
			if (containerComp.children?.length! < index) {
				containerComp.children?.push(...containerComp.children, ...new Array(index));
				containerComp.children!.splice(index, 1, component);
			} else {
				containerComp.children!.splice(index, 1, component);
			}
		}
	};

	// 组件删除
	const deleteComponent = () => {
		const index = components.findIndex((compItem) => compItem.id === currentComponentId.value);
		if (index !== -1) {
			components.splice(index, 1);
			setCurrentComponent({ id: '', label: '', key: '', style: {} }, ''); // 清空当前组件
		}
		// 更新 活动对象树
		const sideMenus = useSideMenus();
		sideMenus.setLiveTimeComps();
	};

	// 画布清空
	const clearComponents = () => {
		components.length = 0;
	};

	// 是否为容器组件
	const isContainer = ref<boolean>(false);

	return {
		editorDom,
		setEditorDom,

		currentComponent,
		currentComponentId,
		setCurrentComponent,
		setCurrentComponentById,
		setShapeStyle,
		updateCurrentComponent,

		isChoosedComponent,
		setChoosedComponentStatus,

		components,
		addComponent,
		addCompInContainer,
		deleteComponent,
		clearComponents,

		isContainer
	};
});
