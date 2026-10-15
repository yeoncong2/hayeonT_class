import { useEffect, useRef } from 'react';
import { createApp, h, shallowReactive } from 'vue';

// React 화면 안에 Vue 컴포넌트를 하나 띄우는 작은 다리 역할.
// Vue 앱은 한 번만 만들고, React 쪽 props 가 바뀌면 Vue 쪽에 그대로 전달해요.
export default function VueIsland({ component, props, className }) {
  const el = useRef(null);
  const state = useRef(null);

  useEffect(() => {
    state.current = shallowReactive({ ...props });
    const app = createApp({ render: () => h(component, state.current) });
    app.mount(el.current);
    return () => app.unmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [component]);

  useEffect(() => {
    if (state.current) Object.assign(state.current, props);
  }, [props]);

  return <div ref={el} className={className} />;
}
