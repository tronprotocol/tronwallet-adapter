import { defineComponent, Teleport } from 'vue';

export const VuePortal = defineComponent({
    props: {
        wrapperId: {
            type: String,
            default: 'vue-portal-wrapper',
        },
    },
    setup(props, { slots }) {
        return () => <Teleport to={`#${props.wrapperId}`}>{() => (slots.default ? slots.default() : '')}</Teleport>;
    },
});
