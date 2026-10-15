import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // React가 메인, Vue는 src/vue/ 안의 작은 위젯만 담당해요.
  plugins: [react({ include: /\.jsx?$/ }), vue()],
  base: './',
  server: {
    // npm run server 로 Node 콘텐츠 서버를 켜 두면 개발 중에도 /api 를 그대로 씁니다.
    proxy: { '/api': 'http://localhost:3001' },
  },
});
