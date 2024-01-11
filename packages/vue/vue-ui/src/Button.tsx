import type { PropType, CSSProperties } from 'vue';
import { defineComponent, ref } from 'vue';
export const ButtonProps = {
    className: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    style: {
        type: Object as PropType<CSSProperties>,
        default: () => ({}),
    },
    tabIndex: {
        type: Number,
        default: 0,
    },
    icon: {
        type: String,
        default: '',
    },
};
export const Button = defineComponent({
    props: ButtonProps,
    emits: ['click'],
    setup(props, { emit, slots }) {
        const buttonRef = ref<HTMLElement | null>();

        function handleClick() {
            emit('click');
            setTimeout(() => {
                buttonRef.value?.blur();
            }, 300);
        }
        return () => (
            <button
                data-testid="wallet-button"
                ref={(el) => (buttonRef.value = el as HTMLElement)}
                onClick={handleClick}
                class={`adapter-vue-button ${props.className}`}
                tabindex={props.tabIndex}
                disabled={props.disabled}
                style={props.style}
            >
                {props.icon && (
                    <i class="button-icon">
                        <img src={props.icon} />
                    </i>
                )}
                {slots.default ? slots.default() : null}
            </button>
        );
    },
});
