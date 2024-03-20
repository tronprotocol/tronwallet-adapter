import { defineComponent, reactive, ref, Teleport, watch } from 'vue';

export const Collapse = defineComponent({
    props: {
        isOpen: {
            type: Boolean,
            default: false,
        },
        telePortId: { type: String, default: '' },
        className: { type: String, default: '' },
        transition: { type: String, default: 'height 250ms ease-out' },
    },
    emits: ['mouseEnter', 'mouseLeave'],
    setup(props, { emit, slots }) {
        const style = reactive<{ height: string; transition: string }>({ height: '0px', transition: props.transition });
        function setStyle(newStyle: { height?: string; transition?: string }) {
            Object.assign(style, newStyle);
        }
        watch(
            () => props.transition,
            function () {
                Object.assign(style, {
                    transition: props.transition,
                });
            }
        );
        const wrapRef = ref<HTMLElement | null>(null);

        function open() {
            if (!wrapRef.value) {
                return;
            }
            setStyle({ height: wrapRef.value?.scrollHeight + 'px' });
        }
        function close() {
            if (!wrapRef.value) {
                return;
            }
            setStyle({ height: '0px' });
        }
        watch(
            () => props.isOpen,
            (isOpen) => {
                if (isOpen) {
                    open();
                } else {
                    close();
                }
            }
        );

        function onMouseEnter() {
            emit('mouseEnter');
        }
        function onMouseLeave() {
            emit('mouseLeave');
        }

        return () => (
            <Teleport to={`#${props.telePortId}`}>
                <div
                    ref={wrapRef}
                    class={`vue-collapse ${props.className}`}
                    style={{ overflow: 'hidden', ...style }}
                    onMouseenter={onMouseEnter}
                    onMouseleave={onMouseLeave}
                >
                    {slots.default ? slots.default() : null}
                </div>
            </Teleport>
        );
    },
});
